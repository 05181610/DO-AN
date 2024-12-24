import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(userId: number, createBookingDto: CreateBookingDto) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: createBookingDto.roomId },
        relations: ['user']
      });

      if (!room) {
        throw new NotFoundException('Phòng không tồn tại');
      }

      if (!room.user) {
        throw new BadRequestException('Thông tin chủ phòng không hợp lệ');
      }

      const viewingDate = new Date(createBookingDto.viewingDate);
      const now = new Date();

      if (viewingDate < now) {
        throw new BadRequestException('Thời gian xem phòng không hợp lệ');
      }

      // Tạo booking với đầy đủ thông tin
      const booking = new Booking();
      booking.user = { id: userId } as any;
      booking.room = room;
      booking.viewingDate = viewingDate;
      booking.note = createBookingDto.note || '';
      booking.status = 'pending';

      const savedBooking = await this.bookingRepository.save(booking);

      // Tạo notification
      if (room.user && room.user.id) {
        const formatter = new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Ho_Chi_Minh'
        });

        const formattedDate = formatter.format(viewingDate);

        await this.notificationsService.create({
          userId: room.user.id,
          title: 'Lịch xem phòng mới',
          message: `Có người muốn xem phòng của bạn vào ${formattedDate}`,
          type: 'booking'
        });
      }

      return savedBooking;
    } catch (error) {
      console.error('Create booking error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Không thể tạo lịch xem phòng. Vui lòng thử lại sau.'
      );
    }
  }

  async findUserBookings(userId: number) {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['room', 'room.user'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateStatus(id: number, userId: number, status: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['room', 'user']
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.room.user.id !== userId) {
      throw new BadRequestException('Not authorized');
    }

    booking.status = status;
    const updatedBooking = await this.bookingRepository.save(booking);

    await this.notificationsService.create({
      userId: booking.user.id,
      title: 'Cập nhật lịch xem phòng',
      message: `Lịch xem phòng của bạn đã được ${status === 'approved' ? 'chấp nhận' : 'từ chối'}`,
      type: 'booking_update'
    });

    return updatedBooking;
  }

  async remove(id: number) {
    const booking = await this.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }
    return this.bookingRepository.remove(booking);
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['room', 'user']
    });
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }
    return booking;
  }
}