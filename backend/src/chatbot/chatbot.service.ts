import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { PreferenceAnalyzerService } from './services/preference-analyzer.service';
import { SearchRequirements } from './interfaces/search-requirements.interface';
import { SearchAnalyzerService } from './services/search-analyzer.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly searchAnalyzer: SearchAnalyzerService
  ) {}

  async handleUserQuery(query: string): Promise<string> {
    // Kiểm tra xem có phải là lời chào
    if (this.isGreeting(query)) {
      return "Xin chào! Tôi là trợ lý ảo tìm phòng trọ. Bạn có thể cho tôi biết bạn đang tìm kiếm phòng như thế nào không? Ví dụ: \n- Tìm phòng dưới 3 triệu ở Quy Nhơn\n- Tìm phòng trọ có máy lạnh và wifi\n- Tìm chung cư 2 phòng ngủ có ban công";
    }

    // Kiểm tra xem có phải yêu cầu xem chi tiết
    const detailResponse = await this.handleViewDetailRequest(query);
    if (detailResponse) {
      return detailResponse;
    }

    // Phân tích yêu cầu từ người dùng
    const requirements = this.analyzeQuery(query);
    
    // Kiểm tra xem có yêu cầu tìm kiếm cụ thể không
    if (!this.hasSearchRequirements(requirements)) {
      return "Bạn vui lòng cho tôi biết thêm chi tiết về loại phòng bạn đang tìm kiếm nhé. Ví dụ như khoảng giá, khu vực, hoặc các tiện ích bạn cần.";
    }
    
    // Tìm kiếm phòng phù hợp
    const rooms = await this.searchRooms(requirements);
    
    // Tạo phản hồi 
    return this.generateResponse(rooms, requirements);
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

    // Phân tích khu vực
    const districts = ['Quy Nhơn', 'An Nhơn', 'Hoài Nhơn'];
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

    // Phân tích tiện ích
    const facilities = ['máy lạnh', 'wifi', 'ban công', 'gác lửng'];
    facilities.forEach(facility => {
      if (query.toLowerCase().includes(facility)) {
        requirements.facilities.push(facility);
      }
    });

    return requirements;
  }

  public async searchRooms(requirements: SearchRequirements) {
    try {
      // First, check if there are any rooms at all
      const totalRooms = await this.roomRepository.count();
      this.logger.debug(`Total rooms in database: ${totalRooms}`);

      const query = this.roomRepository.createQueryBuilder('room')
        .leftJoinAndSelect('room.images', 'images');

      if (requirements.minPrice !== null || requirements.maxPrice !== null) {
        if (requirements.minPrice !== null) {
          query.andWhere('room.price >= :minPrice', {
            minPrice: requirements.minPrice
          });
        }
        if (requirements.maxPrice !== null) {
          query.andWhere('room.price <= :maxPrice', {
            maxPrice: requirements.maxPrice
          });
        }
        this.logger.debug(`Adding price filter: ${requirements.minPrice} - ${requirements.maxPrice}`);
      }

    if (requirements.district) {
      query.andWhere('room.district = :district', {
        district: requirements.district
      });
    }

    if (requirements.type) {
      query.andWhere('room.type = :type', {
        type: requirements.type
      });
    }

    if (requirements.facilities.length > 0) {
      requirements.facilities.forEach((facility, index) => {
        query.andWhere(`room.facilities LIKE :facility${index}`, {
          [`facility${index}`]: `%${facility}%`
        });
        this.logger.debug(`Adding facility filter: ${facility}`);
      });
    }

    // Log the generated SQL query
    const [generatedQuery, parameters] = query.getQueryAndParameters();
    this.logger.debug('Generated SQL:', generatedQuery);
    this.logger.debug('Query parameters:', parameters);

    try {
      const results = await query.take(5).getMany();
      this.logger.debug(`Search returned ${results.length} results`);
      
      // Log chi tiết kết quả để debug
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
      this.logger.error('Error executing search query:', error);
      throw error;
    }

    } catch (error) {
      this.logger.error('Error searching rooms:', error);
      throw error;
    }
  }

  private async generateResponse(rooms: Room[], requirements: SearchRequirements): Promise<string> {
    if (rooms.length === 0) {
      // Lấy gợi ý về khu vực và khoảng giá thay thế
      const suggestedDistricts = await this.searchAnalyzer.getSuggestedDistricts(requirements);
      let alternativeOptions = '';

      if (requirements.maxPrice) {
        const similarPrices = await this.searchAnalyzer.findSimilarPriceRanges(requirements.maxPrice);
        if (similarPrices.length > 0) {
          alternativeOptions += '\nBạn có thể thử với các mức giá sau:\n';
          similarPrices.forEach(price => {
            alternativeOptions += `- ${this.formatPrice(price)}/tháng\n`;
          });
        }
      }

      if (suggestedDistricts.length > 0) {
        alternativeOptions += '\nHoặc thử tìm ở các khu vực sau:\n';
        suggestedDistricts.forEach(district => {
          alternativeOptions += `- ${district}\n`;
        });
      }

      return `Xin lỗi, tôi không tìm thấy phòng nào phù hợp với yêu cầu của bạn.${alternativeOptions}\nBạn có muốn tìm với điều kiện khác không?`;
    }

    const trends = await this.searchAnalyzer.analyzeSearchTrends();
    let response = `Tôi đã tìm thấy ${rooms.length} phòng phù hợp với yêu cầu của bạn:\n\n`;
    
    rooms.forEach((room, index) => {
      response += `🏠 Phòng ${room.id}: ${room.title}\n`;
      response += `   💰 Giá: ${this.formatPrice(room.price)}/tháng\n`;
      response += `   📍 Địa chỉ: ${room.location}\n`;
      if (room.facilities) {
        response += `   ✨ Tiện ích: ${room.facilities}\n`;
      }
      response += `   🔍 Nhấp vào tin nhắn này để xem chi tiết phòng số ${room.id}\n\n`;
    });

    response += 'Bạn có muốn xem thêm thông tin chi tiết về phòng nào không?';

    return response;
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

  private async handleViewDetailRequest(query: string): Promise<string | null> {
    const detailPatterns = [
      /(?:xem|cho xem|muốn xem) (?:chi tiết|thông tin|thêm về) (?:phòng|căn hộ|nhà) (?:số )?(\d+)/i,
      /(?:xem|cho xem|muốn xem) (?:phòng|căn hộ|nhà) (?:số )?(\d+)/i
    ];

    for (const pattern of detailPatterns) {
      const match = query.match(pattern);
      if (match) {
        const roomNumber = parseInt(match[1]);
        const room = await this.roomRepository.findOne({ where: { id: roomNumber } });
        
        if (room) {
          return `Đây là thông tin chi tiết phòng bạn yêu cầu:\n
${room.title}
- Giá: ${this.formatPrice(room.price)}/tháng
- Địa chỉ: ${room.location}\n
Bạn cần hỗ trợ thêm thông tin gì không?`;
        } else {
          return `Xin lỗi, tôi không tìm thấy phòng số ${roomNumber}. Bạn có thể cho tôi biết bạn muốn xem phòng nào không?`;
        }
      }
    }
    return null;
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