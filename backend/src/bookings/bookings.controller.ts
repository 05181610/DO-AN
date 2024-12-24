import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Request,
    Delete,
    UnauthorizedException,
}from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}
     @Post()
    @UseGuards(JwtAuthGuard)
    async create(
      @Request() req,
      @Body() createBookingDto: CreateBookingDto
    ) {
      try {
        console.log('Creating booking with user:', req.user);
        console.log('Booking data:', createBookingDto);
        
        return await this.bookingsService.create(req.user.id, createBookingDto);
      } catch (error) {
        console.error('Create booking error:', error);
        throw error;
      }
    }
     @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Request() req) {
      return this.bookingsService.findUserBookings(req.user.id);
    }
     @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.bookingsService.findOne(+id);
    }
     @Put(':id/status')
    async updateStatus(
      @Param('id') id: string,
      @Body('status') status: string,
      @Request() req,
    ) {
      return this.bookingsService.updateStatus(+id, req.user.id, status);
    }
     @Delete(':id')
    async remove(@Param('id') id: string) {
      return this.bookingsService.remove(+id);
    }
}