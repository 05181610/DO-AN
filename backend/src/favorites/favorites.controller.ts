import { Controller, Get, Post, Delete, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/rooms')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':id/favorite')
  async addToFavorites(@Request() req, @Param('id') roomId: string) {
    console.log('=== ADD TO FAVORITES REQUEST ===');
    console.log('Full request user:', req.user);
    
    const userId = req.user.sub || req.user.id;
    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    console.log('Using userId:', userId);
    return await this.favoritesService.addToFavorites(Number(userId), +roomId);
  }

  @Get(':id/favorite')
  async checkFavorite(@Request() req, @Param('id') roomId: string) {
    const userId = req.user.sub;
    return this.favoritesService.checkFavorite(Number(userId), +roomId);
  }

  @Get()
  async getFavorites(@Request() req) {
    const userId = req.user.sub;
    return this.favoritesService.getFavorites(Number(userId));
  }

  @Get('count')
  async getFavoritesCount(@Request() req) {
    return this.favoritesService.getFavoritesCount(req.user.id);
  }

  @Delete(':roomId')
  @UseGuards(JwtAuthGuard)
  async removeFromFavorites(
    @Request() req,
    @Param('roomId') roomId: string
  ) {
    return this.favoritesService.removeFromFavorites(req.user.id, +roomId);
  }
}