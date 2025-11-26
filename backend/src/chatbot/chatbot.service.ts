import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { PreferenceAnalyzerService } from './services/preference-analyzer.service';
import { SearchRequirements } from './interfaces/search-requirements.interface';
import { SearchAnalyzerService } from './services/search-analyzer.service';
import { AdvancedSearchService, SearchScore } from './services/advanced-search.service';
import { NLPService } from './services/nlp.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly searchAnalyzer: SearchAnalyzerService,
    private readonly advancedSearch: AdvancedSearchService,
    private readonly nlp: NLPService
  ) {}

  async handleUserQuery(query: string): Promise<any> {
    // Kiểm tra xem có phải là lời chào
    if (this.isGreeting(query)) {
      return {
        type: 'greeting',
        message: "Xin chào! 👋 Tôi là trợ lý AI thông minh giúp bạn tìm phòng trọ hoàn hảo. Bạn có thể:\n\n" +
                "📍 Tìm theo khu vực: 'Tìm phòng ở Nhân Bình'\n" +
                "💰 Tìm theo giá: 'Tìm phòng dưới 3 triệu'\n" +
                "🏠 Tìm theo loại: 'Tìm chung cư, nhà trọ, nhà riêng'\n" +
                "✨ Tìm theo tiện ích: 'Tìm phòng có wifi và máy lạnh'\n" +
                "👨‍👩‍👧‍👦 Tìm theo nhu cầu: 'Tìm phòng cho gia đình', 'Tìm phòng sinh viên'\n" +
                "🔍 Kết hợp tiêu chí: 'Tìm chung cư dưới 4 triệu ở Hải Căng có wifi'\n\n" +
                "Bạn muốn tìm phòng nào?"
      };
    }

    // Parse query với NLP
    const nlpResult = this.nlp.parseQuery(query);
    this.logger.debug('NLP Result:', nlpResult);

    // Kiểm tra xem có phải yêu cầu xem chi tiết
    const detailResponse = await this.handleViewDetailRequest(query);
    if (detailResponse) {
      return detailResponse;
    }

    // Normalize query thành structured criteria
    const criteria = this.advancedSearch.normalizeQuery(query);
    this.logger.debug('Query normalized:', criteria);

    // Kiểm tra xem có tiêu chí tìm kiếm nào không
    if (!this.hasCriteria(criteria)) {
      const suggestions = this.nlp.generateSuggestions(nlpResult.intents[0] || 'SEARCH', criteria);
      return {
        type: 'needMoreInfo',
        message: "Để tôi giúp bạn tìm phòng tốt hơn, bạn vui lòng cho biết thêm chi tiết:\n\n" +
                "• 💰 Khoảng giá (VD: dưới 3 triệu, từ 2-4 triệu)\n" +
                "• 📍 Khu vực (VD: Nhân Bình, Hải Căng)\n" +
                "• 🏠 Loại phòng (VD: chung cư, phòng trọ, nhà riêng)\n" +
                "• ✨ Tiện ích (VD: wifi, máy lạnh, máy giặt)\n\n" +
                "Hoặc mô tả thêm yêu cầu của bạn nhé!",
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };
    }

    // Advanced search với multi-criteria
    try {
      this.logger.debug('Starting advanced search with criteria:', criteria);
      const rankedResults = await this.advancedSearch.getRankedRooms(
        criteria,
        10
      );
      this.logger.debug(`Advanced search returned ${rankedResults.length} results`);

      if (rankedResults.length === 0) {
        const suggestions = this.nlp.generateSuggestions(nlpResult.intents[0] || 'SEARCH', criteria);
        return this.generateNoResultsResponse(criteria, suggestions);
      }

      return this.generateSearchResultsResponse(rankedResults, criteria);
    } catch (error) {
      this.logger.error('Error in advanced search:', error);
      return {
        type: 'error',
        message: 'Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.'
      };
    }
  }

  private analyzeQuery(query: string): SearchRequirements {
    const requirements: SearchRequirements = {
      priceRange: null,
      district: null,
      type: null,
      facilities: [],
      minPrice: null,
      maxPrice: null,
      suggestedDistricts: [],
      alternativePriceRanges: []
    };

    // Phân tích giá với nhiều pattern
    const pricePatterns = [
      { 
        regex: /dưới (\d+)( triệu)?/i,
        handler: (match: RegExpMatchArray) => {
          const price = parseInt(match[1]);
          return { minPrice: 0, maxPrice: price * 1000000 };
        }
      },
      { 
        regex: /từ (\d+)( triệu)? đến (\d+)( triệu)?/i,
        handler: (match: RegExpMatchArray) => {
          const minPrice = parseInt(match[1]);
          const maxPrice = parseInt(match[3]);
          return { 
            minPrice: minPrice * 1000000, 
            maxPrice: maxPrice * 1000000 
          };
        }
      },
      { 
        regex: /khoảng (\d+)( triệu)?/i,
        handler: (match: RegExpMatchArray) => {
          const price = parseInt(match[1]);
          return { 
            minPrice: (price - 0.5) * 1000000, 
            maxPrice: (price + 0.5) * 1000000 
          };
        }
      }
    ];

    // Áp dụng các pattern phân tích giá
    for (const pattern of pricePatterns) {
      const match = query.match(pattern.regex);
      if (match) {
        const result = pattern.handler(match);
        requirements.minPrice = result.minPrice;
        requirements.maxPrice = result.maxPrice;
        requirements.priceRange = `${result.minPrice/1000000}-${result.maxPrice/1000000}`;
        break;
      }
    }

    // Phân tích khu vực - từ dữ liệu thực tế
    const districts = ['Nhân Bình', 'Hải Căng', 'Lê Lợi', 'Ngô Mây', 'Nhơn Phú', 'Lý Thường Kiệt'];
    districts.forEach(district => {
      if (query.toLowerCase().includes(district.toLowerCase())) {
        requirements.district = district;
      }
    });

    // Phân tích loại phòng
    const roomTypes = {
      'APARTMENT': ['chung cư', 'căn hộ', 'cao cấp', 'apartment'],
      'MOTEL': ['phòng trọ', 'nhà trọ', 'motel', 'phòng cho thuê'],
      'HOUSE': ['nhà nguyên căn', 'nhà riêng', 'biệt thự', 'house']
    };
    
    for (const [type, keywords] of Object.entries(roomTypes)) {
      if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
        requirements.type = type;
        break;
      }
    }

    // Phân tích tiện ích - từ dữ liệu thực tế
    const facilities = ['Máy lạnh', 'Wifi', 'Tủ lạnh', 'Máy giặt', 'Ban công', 'Gác lửng'];
    facilities.forEach(facility => {
      if (query.toLowerCase().includes(facility.toLowerCase())) {
        requirements.facilities.push(facility);
      }
    });

    return requirements;
  }

  public async searchRooms(requirements: SearchRequirements) {
    try {
      const totalRooms = await this.roomRepository.count();
      this.logger.debug(`Total rooms in database: ${totalRooms}`);

      let query = this.roomRepository.createQueryBuilder('room')
        .leftJoinAndSelect('room.images', 'images');

      // Filter by price range
      if (requirements.minPrice !== null) {
        query = query.andWhere('room.price >= :minPrice', {
          minPrice: requirements.minPrice
        });
      }
      if (requirements.maxPrice !== null) {
        query = query.andWhere('room.price <= :maxPrice', {
          maxPrice: requirements.maxPrice
        });
      }

      // Filter by district
      if (requirements.district) {
        query = query.andWhere('room.district = :district', {
          district: requirements.district
        });
      }

      // Filter by type
      if (requirements.type) {
        query = query.andWhere('room.type = :type', {
          type: requirements.type
        });
      }

      // Filter by facilities - match text in comma-separated list
      if (requirements.facilities.length > 0) {
        requirements.facilities.forEach((facility, index) => {
          query = query.andWhere(`room.facilities LIKE :facility${index}`, {
            [`facility${index}`]: `%${facility}%`
          });
          this.logger.debug(`Adding facility filter: ${facility}`);
        });
      }

      // Log the generated SQL query
      const [generatedQuery, parameters] = query.getQueryAndParameters();
      this.logger.debug('Generated SQL:', generatedQuery);
      this.logger.debug('Query parameters:', parameters);

      const results = await query.take(10).getMany();
      this.logger.debug(`Search returned ${results.length} results`);
      
      results.forEach((room, index) => {
        this.logger.debug(`Room ${index + 1}:`, {
          id: room.id,
          title: room.title,
          price: room.price,
          district: room.district
        });
      });
      
      return results;
    } catch (error) {
      this.logger.error('Error searching rooms:', error);
      throw error;
    }
  }

  private async generateResponse(rooms: Room[], requirements: SearchRequirements): Promise<any> {
    if (rooms.length === 0) {
      const suggestedDistricts = await this.searchAnalyzer.getSuggestedDistricts(requirements);
      let suggestions = [];

      if (requirements.maxPrice) {
        const similarPrices = await this.searchAnalyzer.findSimilarPriceRanges(requirements.maxPrice);
        if (similarPrices.length > 0) {
          suggestions = similarPrices.map(price => ({
            type: 'priceRange',
            value: price,
            label: this.formatPrice(price)
          }));
        }
      }

      if (suggestedDistricts.length > 0 && suggestions.length === 0) {
        suggestions = suggestedDistricts.map(district => ({
          type: 'district',
          value: district,
          label: district
        }));
      }

      return {
        type: 'noResults',
        message: 'Xin lỗi, tôi không tìm thấy phòng nào phù hợp với yêu cầu của bạn.',
        suggestions: suggestions,
        hasAlternatives: suggestions.length > 0
      };
    }

    return {
      type: 'searchResults',
      message: `Tìm thấy ${rooms.length} phòng phù hợp với yêu cầu của bạn`,
      count: rooms.length,
      rooms: rooms.map((room, index) => ({
        id: room.id,
        title: room.title,
        price: room.price,
        priceFormatted: this.formatPrice(room.price),
        location: room.location,
        district: room.district,
        type: room.type,
        facilities: room.facilities,
        area: room.area,
        description: room.description,
        images: room.images?.map(img => img.url) || [],
        rating: room.averageRating || 0,
        viewCount: room.viewCount || 0,
        favoriteCount: room.favoriteCount || 0
      }))
    };
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  private isGreeting(query: string): boolean {
    const greetings = [
      'xin chào',
      'chào',
      'hi',
      'hello',
      'hey',
      'alo',
      'chào bạn'
    ];
    return greetings.some(greeting => 
      query.toLowerCase().trim() === greeting
    );
  }

  private async handleViewDetailRequest(query: string): Promise<any | null> {
    const detailPatterns = [
      /(?:xem|cho xem|muốn xem) (?:chi tiết|thông tin|thêm về) (?:phòng|căn hộ|nhà) (?:số )?(\d+)/i,
      /(?:xem|cho xem|muốn xem) (?:phòng|căn hộ|nhà) (?:số )?(\d+)/i
    ];

    for (const pattern of detailPatterns) {
      const match = query.match(pattern);
      if (match) {
        const roomNumber = parseInt(match[1]);
        const room = await this.roomRepository.findOne({ 
          where: { id: roomNumber },
          relations: ['images']
        });
        
        if (room) {
          return {
            type: 'roomDetail',
            room: {
              id: room.id,
              title: room.title,
              price: room.price,
              priceFormatted: this.formatPrice(room.price),
              location: room.location,
              district: room.district,
              type: room.type,
              facilities: room.facilities,
              area: room.area,
              description: room.description,
              images: room.images?.map(img => img.url) || [],
              rating: room.averageRating || 0,
              viewCount: room.viewCount || 0,
              favoriteCount: room.favoriteCount || 0
            },
            message: `Đây là thông tin chi tiết phòng bạn yêu cầu`
          };
        } else {
          return {
            type: 'roomNotFound',
            message: `Xin lỗi, tôi không tìm thấy phòng số ${roomNumber}. Bạn có thể cho tôi biết bạn muốn xem phòng nào không?`
          };
        }
      }
    }
    return null;
  }

  private hasCriteria(criteria: any): boolean {
    return (
      criteria.priceMin !== undefined ||
      criteria.priceMax !== undefined ||
      (criteria.districts && criteria.districts.length > 0) ||
      (criteria.types && criteria.types.length > 0) ||
      (criteria.facilities && criteria.facilities.length > 0) ||
      (criteria.searchText && criteria.searchText.trim())
    );
  }

  private generateSearchResultsResponse(rankedResults: SearchScore[], criteria: any): any {
    const rooms = rankedResults.map(result => result.room);
    
    return {
      type: 'searchResults',
      message: `✅ Tìm thấy ${rooms.length} phòng phù hợp với tiêu chí của bạn!`,
      count: rooms.length,
      criteria: {
        priceRange: criteria.priceMin && criteria.priceMax 
          ? `${this.formatPrice(criteria.priceMin)} - ${this.formatPrice(criteria.priceMax)}`
          : criteria.priceMax 
          ? `Dưới ${this.formatPrice(criteria.priceMax)}`
          : undefined,
        districts: criteria.districts,
        types: criteria.types,
        facilities: criteria.facilities
      },
      rooms: rooms.map((room, index) => ({
        rank: index + 1,
        id: room.id,
        title: room.title,
        price: room.price,
        priceFormatted: this.formatPrice(room.price),
        location: room.location,
        district: room.district,
        type: room.type,
        facilities: room.facilities || [],
        area: room.area,
        description: room.description?.substring(0, 150) + '...' || '',
        images: room.images?.map(img => img.url) || [],
        rating: room.averageRating || 0,
        viewCount: room.viewCount || 0,
        favoriteCount: room.favoriteCount || 0
      }))
    };
  }

  private generateNoResultsResponse(criteria: any, suggestions?: string[]): any {
    return {
      type: 'noResults',
      message: '😔 Xin lỗi, không tìm thấy phòng phù hợp với tiêu chí của bạn.',
      suggestions: suggestions || []
    };
  }

  private generateSuggestions(criteria: any): any[] {
    const suggestions: any[] = [];

    // Gợi ý nới khoảng giá
    if (criteria.priceMax) {
      suggestions.push({
        type: 'priceRange',
        title: '💰 Nới khoảng giá',
        description: `Thử tìm phòng trong khoảng giá cao hơn một chút`,
        newPrice: criteria.priceMax + 1000000
      });
    }

    // Gợi ý thay đổi khu vực
    if (criteria.districts && criteria.districts.length > 0) {
      suggestions.push({
        type: 'district',
        title: '📍 Thay đổi khu vực',
        description: 'Thử tìm phòng ở khu vực khác',
        availableDistricts: ['Nhân Bình', 'Hải Căng', 'Lê Lợi', 'Ngô Mây', 'Nhơn Phú', 'Lý Thường Kiệt']
      });
    }

    // Gợi ý loại bỏ tiện ích
    if (criteria.facilities && criteria.facilities.length > 0) {
      suggestions.push({
        type: 'facilities',
        title: '✨ Loại bỏ một số tiện ích',
        description: 'Thử tìm phòng mà không cần tất cả tiện ích'
      });
    }

    return suggestions;
  }

  private hasSearchRequirements(requirements: SearchRequirements): boolean {
    return (
      requirements.priceRange !== null ||
      requirements.district !== null ||
      requirements.type !== null ||
      requirements.facilities.length > 0
    );
  }
}