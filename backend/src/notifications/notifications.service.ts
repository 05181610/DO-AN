import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {}

  async create(notificationData: any) {
    const notification = this.notificationRepository.create(notificationData);
    return await this.notificationRepository.save(notification);
  }

  async findUserNotifications(userId: number) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.notificationRepository.update(
      { id, user: { id: userId } },
      { isRead: true }
    );
  }

  // Thêm các methods khác nếu cần
} 