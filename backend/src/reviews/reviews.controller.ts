import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get('room/:roomId')
  async findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    console.log('ReviewController - Received roomId:', roomId, typeof roomId);
    try {
      const reviews = await this.reviewsService.findByRoom(roomId);
      console.log('ReviewController - Found reviews:', reviews.length);
      return reviews;
    } catch (error) {
      console.error('ReviewController - Error:', error);
      throw error;
    }
  }
}   