import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

export interface UserPreference {
  priceRange?: { min: number; max: number };
  location?: string;
  roomType?: string;
  essentialFacilities: string[];
  additionalPreferences: {
    hasParking?: boolean;
    hasElevator?: boolean;
    isQuiet?: boolean;
    nearUniversity?: boolean;
    nearMarket?: boolean;
  };
}

@Injectable()
export class PreferenceAnalyzerService {
  private readonly logger = new Logger(PreferenceAnalyzerService.name);
  private userPreferences: Map<string, UserPreference> = new Map();

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) {}

  async analyzePreferences(userId: string, message: string): Promise<UserPreference> {
    let preferences = this.userPreferences.get(userId) || {
      essentialFacilities: [],
      additionalPreferences: {}
    };

    // Phân tích khoảng giá
    const pricePatterns = [
      {
        pattern: /(?:dưới|không quá|tối đa) (\d+)(?:\s*triệu)?/i,
        handler: (match: RegExpMatchArray) => ({
          min: 0,
          max: parseFloat(match[1]) * 1000000
        })
      },
      {
        pattern: /(?:từ|khoảng) (\d+)\s*(?:đến|tới|->)\s*(\d+)(?:\s*triệu)?/i,
        handler: (match: RegExpMatchArray) => ({
          min: parseFloat(match[1]) * 1000000,
          max: parseFloat(match[2]) * 1000000
        })
      },
      {
        pattern: /khoảng (\d+)(?:\s*triệu)?/i,
        handler: (match: RegExpMatchArray) => {
          const basePrice = parseFloat(match[1]);
          return {
            min: (basePrice - 0.5) * 1000000,
            max: (basePrice + 0.5) * 1000000
          };
        }
      }
    ];

    for (const { pattern, handler } of pricePatterns) {
      const match = message.match(pattern);
      if (match) {
        preferences.priceRange = handler(match);
        break;
      }
    }

    // Phân tích vị trí
    const locationPatterns = {
      'gần trường': ['trường', 'đại học', 'university', 'trường học', 'sinh viên'],
      'gần chợ': ['chợ', 'market', 'siêu thị', 'mua sắm'],
      'khu dân cư': ['khu dân cư', 'yên tĩnh', 'an ninh'],
      'trung tâm': ['trung tâm', 'center', 'downtown']
    };

    for (const [location, keywords] of Object.entries(locationPatterns)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        preferences.location = location;
      }
    }

    // Phân tích tiện ích cần thiết
    const facilityKeywords = {
      'máy lạnh': ['máy lạnh', 'điều hòa', 'mát mẻ'],
      'wifi': ['wifi', 'internet', 'mạng'],
      'tủ lạnh': ['tủ lạnh', 'refrigerator'],
      'máy giặt': ['máy giặt', 'giặt ủi'],
      'nội thất': ['nội thất', 'full đồ', 'đầy đủ tiện nghi']
    };

    for (const [facility, keywords] of Object.entries(facilityKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        if (!preferences.essentialFacilities.includes(facility)) {
          preferences.essentialFacilities.push(facility);
        }
      }
    }

    // Phân tích sở thích bổ sung
    const additionalPrefs = {
      hasParking: ['để xe', 'parking', 'gửi xe'],
      hasElevator: ['thang máy', 'elevator', 'lift'],
      isQuiet: ['yên tĩnh', 'quiet', 'không ồn'],
      nearUniversity: ['gần trường', 'near university', 'gần đại học'],
      nearMarket: ['gần chợ', 'near market', 'tiện mua sắm']
    };

    for (const [pref, keywords] of Object.entries(additionalPrefs)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        preferences.additionalPreferences[pref] = true;
      }
    }

    this.userPreferences.set(userId, preferences);
    return preferences;
  }

  async findMatchingRooms(preferences: UserPreference): Promise<Room[]> {
    let query = this.roomRepository.createQueryBuilder('room');

    if (preferences.priceRange) {
      query = query.andWhere('room.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: preferences.priceRange.min,
        maxPrice: preferences.priceRange.max
      });
    }

    if (preferences.location) {
      query = query.andWhere('room.district LIKE :location', {
        location: `%${preferences.location}%`
      });
    }

    if (preferences.essentialFacilities.length > 0) {
      preferences.essentialFacilities.forEach((facility, index) => {
        query = query.andWhere(`room.facilities LIKE :facility${index}`, {
          [`facility${index}`]: `%${facility}%`
        });
      });
    }

    // Thêm các điều kiện bổ sung
    if (preferences.additionalPreferences.nearUniversity) {
      query = query.andWhere('room.nearbyPlaces LIKE :university', {
        university: '%trường%'
      });
    }

    if (preferences.additionalPreferences.nearMarket) {
      query = query.andWhere('room.nearbyPlaces LIKE :market', {
        market: '%chợ%'
      });
    }

    // Sắp xếp kết quả theo độ phù hợp
    query = query
      .orderBy('room.rating', 'DESC')
      .addOrderBy('room.price', 'ASC');

    return await query.take(5).getMany();
  }

  getUserPreferences(userId: string): UserPreference | undefined {
    return this.userPreferences.get(userId);
  }

  clearUserPreferences(userId: string): void {
    this.userPreferences.delete(userId);
  }
}