import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    try {
      const review = this.reviewRepository.create({
        user: { id: userId },
        room: { id: createReviewDto.roomId },
        comment: createReviewDto.comment,
        rating: createReviewDto.rating
      });

      await this.reviewRepository.save(review);

      const room = await this.roomRepository.findOne({
        where: { id: createReviewDto.roomId }
      });

      const activity = this.activityRepository.create({
        type: 'review',
        user: { id: userId },
        room: { id: createReviewDto.roomId },
        description: `Đã đánh giá phòng: ${room.title}`,
        createdAt: new Date()
      });

      await this.activityRepository.save(activity);

      return review;
    } catch (error) {
      console.error('Create review error:', error);
      throw new BadRequestException('Không thể tạo đánh giá');
    }
  }

  async findByRoom(roomId: number) {
    try {
      // Kiểm tra roomId
      if (!roomId || isNaN(roomId)) {
        throw new BadRequestException('Invalid roomId');
      }

      const reviews = await this.reviewRepository.find({
        where: { room: { id: roomId } },
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
      throw new BadRequestException('Không thể lấy danh sách đánh giá');
    }
  }

  async deleteReview(id: number, userId: number) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user', 'room']
      });

      if (!review) {
        throw new NotFoundException('Không tìm thấy đánh giá hoặc không có quyền xóa');
      }

      // Lưu activity trước khi xóa review
      const activity = this.activityRepository.create({
        type: 'delete_review',
        user: { id: userId },
        room: { id: review.room.id },
        description: `Đã xóa đánh giá cho phòng: ${review.room.title}`,
        createdAt: new Date()
      });

      await this.activityRepository.save(activity);

      // Xóa review
      await this.reviewRepository.remove(review);

      return { message: 'Xóa đánh giá thành công' };
    } catch (error) {
      console.error('Delete review error:', error);
      throw new BadRequestException('Không thể xóa đánh giá');
    }
  }
}