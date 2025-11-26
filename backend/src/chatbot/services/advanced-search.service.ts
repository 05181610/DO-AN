import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Fuse from 'fuse.js';
import { Room } from '../../rooms/entities/room.entity';

export interface SearchScore {
  room: Room;
  score: number;
  matchedFields: string[];
}

@Injectable()
export class AdvancedSearchService {
  private readonly logger = new Logger(AdvancedSearchService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) {}

  /**
   * Multi-criteria search với fuzzy matching
   * Tìm phòng dựa trên: giá, khu vực, loại, tiện ích, địa chỉ
   */
  async multiCriteriaSearch(
    priceMin?: number,
    priceMax?: number,
    districts?: string[],
    types?: string[],
    facilities?: string[],
    searchText?: string,
    sortBy: 'price' | 'rating' | 'relevance' = 'relevance'
  ): Promise<SearchScore[]> {
    try {
      // Lấy tất cả phòng từ database
      const allRooms = await this.roomRepository.find({
        relations: ['images']
      });

      if (allRooms.length === 0) {
        return [];
      }

      const results: SearchScore[] = [];

      // Score từng phòng dựa trên các tiêu chí
      for (const room of allRooms) {
        let score = 100; // Điểm tối đa
        const matchedFields: string[] = [];

        // 0. Filter STRICT cho type - nếu user chỉ định type thì BẮT BUỘC phải match
        if (types && types.length > 0) {
          if (!types.includes(room.type)) {
            // Không match type - skip room này hoàn toàn
            continue;
          } else {
            score += 20; // Bonus nếu match type
            matchedFields.push('type');
          }
        }

        // 1. Filter giá - STRICT: nếu user chỉ định giá thì phải match
        if (priceMin !== undefined || priceMax !== undefined) {
          let priceMatches = true;
          
          if (priceMin !== undefined && room.price < priceMin) {
            priceMatches = false;
          }
          if (priceMax !== undefined && room.price > priceMax) {
            priceMatches = false;
          }
          
          if (!priceMatches) {
            // Không match price - skip room này
            continue;
          } else {
            score += 30; // Bonus nếu match giá
            matchedFields.push('price');
          }
        }

        // 2. Filter khu vực với fuzzy matching
        if (districts && districts.length > 0) {
          const districtMatch = this.fuzzyMatchArray(room.district, districts);
          if (districtMatch) {
            score += 20; // Bonus nếu match khu vực
            matchedFields.push('district');
          } else {
            score -= 30;
          }
        }

        // 3. Filter tiện ích
        if (facilities && facilities.length > 0) {
          const facilitiesMatched = this.countMatchedFacilities(
            room.facilities,
            facilities
          );
          if (facilitiesMatched > 0) {
            score += facilitiesMatched * 10;
            matchedFields.push('facilities');
          } else {
            score -= 15;
          }
        }

        // 4. Fuzzy search text trên title, description, location
        if (searchText && searchText.trim()) {
          const textScore = this.fuzzySearchText(
            room.title,
            room.description,
            room.location,
            searchText
          );
          score += textScore;
          if (textScore > 0) {
            matchedFields.push('text');
          }
        }

        // Chỉ thêm phòng có score > 0
        if (score > 0) {
          results.push({ room, score, matchedFields });
        }
      }

      // Sort theo tiêu chí
      if (sortBy === 'price') {
        results.sort((a, b) => a.room.price - b.room.price);
      } else if (sortBy === 'rating') {
        results.sort(
          (a, b) => b.room.averageRating - a.room.averageRating
        );
      } else {
        // relevance (mặc định)
        results.sort((a, b) => b.score - a.score);
      }

      this.logger.debug(`multiCriteriaSearch returned ${results.length} results`);

      return results;
    } catch (error) {
      this.logger.error('Error in multi-criteria search:', error);
      throw error;
    }
  }

  /**
   * Fuzzy match một giá trị với mảng
   */
  private fuzzyMatchArray(
    value: string,
    arrayToMatch: string[],
    threshold: number = 0.5
  ): boolean {
    if (!arrayToMatch || arrayToMatch.length === 0) return true;

    const valueLower = value?.toLowerCase() || '';
    
    return arrayToMatch.some(item => {
      const itemLower = item?.toLowerCase() || '';
      
      // Exact match
      if (valueLower === itemLower) return true;
      
      // Contains match
      if (valueLower.includes(itemLower) || itemLower.includes(valueLower)) {
        return true;
      }

      // Similarity
      const similarity = this.stringSimilarity(valueLower, itemLower);
      return similarity >= threshold;
    });
  }

  /**
   * Đếm số tiện ích match
   */
  private countMatchedFacilities(
    roomFacilities: string[] | string,
    searchFacilities: string[]
  ): number {
    if (!roomFacilities) return 0;

    // Convert to string nếu là array
    let facilitiesStr = '';
    if (Array.isArray(roomFacilities)) {
      facilitiesStr = roomFacilities.join(',').toLowerCase();
    } else {
      facilitiesStr = (roomFacilities as string).toLowerCase();
    }

    return searchFacilities.filter(f => {
      const fLower = f.toLowerCase();
      return facilitiesStr.includes(fLower);
    }).length;
  }

  /**
   * Fuzzy search text
   */
  private fuzzySearchText(
    title: string,
    description: string,
    location: string,
    searchText: string
  ): number {
    let score = 0;

    // Title match (cao nhất)
    if (title.toLowerCase().includes(searchText.toLowerCase())) {
      score += 30;
    } else {
      const titleSimilarity = this.stringSimilarity(
        title.toLowerCase(),
        searchText.toLowerCase()
      );
      score += titleSimilarity * 20;
    }

    // Description match
    if (
      description &&
      description.toLowerCase().includes(searchText.toLowerCase())
    ) {
      score += 15;
    }

    // Location match
    if (location && location.toLowerCase().includes(searchText.toLowerCase())) {
      score += 20;
    }

    return Math.min(score, 50); // Max 50 điểm cho text match
  }

  /**
   * Tính Levenshtein similarity
   */
  private stringSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }

    return costs[s2.length];
  }

  /**
   * Normalize query - chuyển người dùng input thành structured data
   */
  normalizeQuery(
    query: string
  ): {
    priceMin?: number;
    priceMax?: number;
    districts?: string[];
    types?: string[];
    facilities?: string[];
    searchText?: string;
  } {
    const result: any = {};
    const lowerQuery = query.toLowerCase();

    // Khu vực thực tế trong database
    const allDistricts = [
      'Nhân Bình',
      'Hải Căng',
      'Lê Lợi',
      'Ngô Mây',
      'Nhơn Phú',
      'Lý Thường Kiệt'
    ];

    // Tìm districts - case insensitive
    const districts: string[] = [];
    allDistricts.forEach(d => {
      if (lowerQuery.includes(d.toLowerCase())) {
        districts.push(d);
      }
    });
    if (districts.length > 0) {
      result.districts = districts;
    }

    // Tìm types
    const typeMapping = {
      APARTMENT: ['chung cư', 'căn hộ', 'cao cấp', 'apartment'],
      MOTEL: ['phòng trọ', 'nhà trọ', 'motel', 'phòng cho thuê'],
      HOUSE: ['nhà nguyên căn', 'nhà riêng', 'biệt thự', 'house']
    };

    const types: string[] = [];
    Object.entries(typeMapping).forEach(([type, keywords]) => {
      if (keywords.some(k => lowerQuery.includes(k))) {
        types.push(type);
      }
    });
    if (types.length > 0) {
      result.types = types;
    }

    // Tìm tiện ích - match từ database thực tế
    const facilitiesMap = {
      'Máy lạnh': ['máy lạnh', 'air', 'ac', 'điều hòa'],
      'Wifi': ['wifi', 'wifi', 'internet'],
      'Tủ lạnh': ['tủ lạnh', 'tủ', 'fridge'],
      'Máy giặt': ['máy giặt', 'giặt', 'washing'],
      'Ban công': ['ban công', 'balcony', 'ban công'],
      'Gác lửng': ['gác lửng', 'gác', 'lửng']
    };

    const matchedFacilities: string[] = [];
    Object.entries(facilitiesMap).forEach(([facility, keywords]) => {
      if (keywords.some(k => lowerQuery.includes(k))) {
        matchedFacilities.push(facility);
      }
    });
    if (matchedFacilities.length > 0) {
      result.facilities = matchedFacilities;
    }

    // Tìm giá - improve regex patterns
    const priceRegexes = [
      {
        regex: /dưới\s+(\d+)\s*(?:triệu)?/i,
        handler: (match: RegExpMatchArray) => ({
          priceMin: undefined,
          priceMax: parseInt(match[1]) * 1000000
        })
      },
      {
        regex: /từ\s+(\d+)\s*(?:triệu)?\s+đến\s+(\d+)\s*(?:triệu)?/i,
        handler: (match: RegExpMatchArray) => ({
          priceMin: parseInt(match[1]) * 1000000,
          priceMax: parseInt(match[2]) * 1000000
        })
      },
      {
        regex: /khoảng\s+(\d+)\s*(?:triệu)?/i,
        handler: (match: RegExpMatchArray) => {
          const price = parseInt(match[1]) * 1000000;
          return {
            priceMin: price - 500000,
            priceMax: price + 500000
          };
        }
      },
      {
        regex: /(\d+)\s*(?:triệu)?\s*(?:\-|đến)\s*(\d+)\s*(?:triệu)?/i,
        handler: (match: RegExpMatchArray) => ({
          priceMin: parseInt(match[1]) * 1000000,
          priceMax: parseInt(match[2]) * 1000000
        })
      },
      {
        regex: /(\d+)\s*triệu/i,
        handler: (match: RegExpMatchArray) => {
          const price = parseInt(match[1]) * 1000000;
          return {
            priceMin: price - 500000,
            priceMax: price + 500000
          };
        }
      }
    ];

    for (const { regex, handler } of priceRegexes) {
      const match = query.match(regex);
      if (match) {
        const priceResult = handler(match);
        Object.assign(result, priceResult);
        break;
      }
    }

    // Search text - phần còn lại của query
    let searchText = query
      .replace(
        new RegExp(
          `(${allDistricts.join('|')}|dưới|từ|đến|khoảng|triệu|${Object.values(
            typeMapping
          )
            .flat()
            .join('|')}|${Object.keys(facilitiesMap).join('|')}|${Object.values(
            facilitiesMap
          )
            .flat()
            .join('|')})`,
          'gi'
        ),
        ''
      )
      .trim();

    if (searchText) {
      result.searchText = searchText;
    }

    this.logger.debug('Normalized query:', { originalQuery: query, result });

    return result;
  }

  /**
   * Ranking & filtering rooms
   */
  async getRankedRooms(
    criteria: {
      priceMin?: number;
      priceMax?: number;
      districts?: string[];
      types?: string[];
      facilities?: string[];
      searchText?: string;
    },
    limit: number = 10
  ): Promise<SearchScore[]> {
    const results = await this.multiCriteriaSearch(
      criteria.priceMin,
      criteria.priceMax,
      criteria.districts,
      criteria.types,
      criteria.facilities,
      criteria.searchText,
      'relevance'
    );

    return results.slice(0, limit);
  }
}
