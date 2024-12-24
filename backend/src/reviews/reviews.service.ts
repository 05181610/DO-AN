import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    try {
      const review = this.reviewRepository.create({
        user: { id: userId },
        room: { id: createReviewDto.roomId },
        comment: createReviewDto.comment,
        rating: createReviewDto.rating
      });

      return await this.reviewRepository.save(review);
    } catch (error) {
      console.error('Create review error:', error);
      throw new BadRequestException('Không thể tạo đánh giá');
    }
  }

  async findByRoom(roomId: number) {
    try {
      console.log('Finding reviews for room:', roomId, typeof roomId);
      
      const parsedRoomId = parseInt(roomId.toString(), 10);
      if (isNaN(parsedRoomId)) {
        throw new BadRequestException('Invalid roomId');
      }

      const reviews = await this.reviewRepository.find({
        where: { room: { id: parsedRoomId } },
        relations: ['user'],
        order: { createdAt: 'DESC' }
      });

      return reviews.map(review => ({
        id: review.id,
        content: review.comment,
        rating: review.rating,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          name: review.user.fullName || 'Người dùng'
        }
      }));
    } catch (error) {
      console.error('Find reviews error:', error);
      throw new BadRequestException('Không thể lấy danh sách đánh giá');
    }
  }

  async deleteReview(id: number, userId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá hoặc không có quyền xóa');
    }

    return this.reviewRepository.remove(review);
  }
}