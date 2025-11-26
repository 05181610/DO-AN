import { Controller, Get, Post, Delete, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('rooms/:id')
  async addToFavorites(@Request() req, @Param('id') roomId: string) {
    try {
      console.log('=== POST /favorites/rooms/:id ===');
      console.log('User:', req.user);
      console.log('RoomId param:', roomId);
      
      const userId = req.user.id;
      if (!userId) {
        throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
      }

      console.log('Adding favorite - userId:', userId, 'roomId:', roomId);
      const result = await this.favoritesService.addToFavorites(Number(userId), +roomId);
      console.log('✅ Favorite added:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in addToFavorites:', error.message);
      throw error;
    }
  }

  @Get('rooms/:id')
  async checkFavorite(@Request() req, @Param('id') roomId: string) {
    const userId = req.user.id;
    return this.favoritesService.checkFavorite(Number(userId), +roomId);
  }

  @Get()
  async getFavorites(@Request() req) {
    console.log('🔍 GET /favorites - req.user:', req.user);
    const userId = req.user.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    console.log('📦 Getting favorites for userId:', userId);
    return this.favoritesService.getFavorites(Number(userId));
  }

  @Get('count')
  async getFavoritesCount(@Request() req) {
    return this.favoritesService.getFavoritesCount(req.user.id);
  }

  @Delete('rooms/:roomId')
  @UseGuards(JwtAuthGuard)
  async removeFromFavorites(
    @Request() req,
    @Param('roomId') roomId: string
  ) {
    return this.favoritesService.removeFromFavorites(req.user.id, +roomId);
  }
}