import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async getLandlordStats(userId: number) {
    const totalRooms = await this.roomRepository.count({
      where: { user: { id: userId } }
    });

    const totalBookings = await this.bookingRepository.count({
      where: { room: { user: { id: userId } } }
    });

    const recentBookings = await this.bookingRepository.find({
      where: { room: { user: { id: userId } } },
      take: 5,
      order: { createdAt: 'DESC' },
      relations: ['user', 'room']
    });

    const roomStats = await this.roomRepository
      .createQueryBuilder('room')
      .select('room.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('room.userId = :userId', { userId })
      .groupBy('room.type')
      .getRawMany();

    return {
      totalRooms,
      totalBookings,
      recentBookings,
      roomStats
    };
  }
} 