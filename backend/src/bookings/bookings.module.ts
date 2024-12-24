import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Room]),
    NotificationsModule
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService]
})
export class BookingsModule {}