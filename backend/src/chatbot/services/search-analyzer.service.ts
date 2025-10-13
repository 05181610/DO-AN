import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { SearchRequirements, SearchSuggestion } from '../interfaces/search-requirements.interface';

@Injectable()
export class SearchAnalyzerService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) {}

  async analyzeSearchTrends(): Promise<SearchSuggestion[]> {
    const suggestions = await this.roomRepository
      .createQueryBuilder('room')
      .select('room.district', 'district')
      .addSelect('AVG(room.price)', 'averagePrice')
      .addSelect('COUNT(*)', 'availableCount')
      .groupBy('room.district')
      .getRawMany();

    return suggestions.map(suggestion => ({
      district: suggestion.district,
      averagePrice: Math.round(suggestion.averagePrice),
      availableCount: parseInt(suggestion.availableCount)
    }));
  }

  async findSimilarPriceRanges(price: number): Promise<number[]> {
    // Tìm các khoảng giá tương tự dựa trên dữ liệu thực tế
    const variance = price * 0.2; // 20% variance
    return await this.roomRepository
      .createQueryBuilder('room')
      .select('DISTINCT room.price')
      .where('room.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: price - variance,
        maxPrice: price + variance
      })
      .orderBy('room.price')
      .limit(3)
      .getRawMany();
  }

  async getSuggestedDistricts(requirements: SearchRequirements): Promise<string[]> {
    let query = this.roomRepository
      .createQueryBuilder('room')
      .select('DISTINCT room.district')
      .where('1=1');

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

    const districts = await query.getRawMany();
    return districts.map(d => d.district);
  }
}