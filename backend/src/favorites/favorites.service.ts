import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Room } from '../rooms/entities/room.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async addToFavorites(userId: number, roomId: number) {
    try {
      // Kiểm tra user tồn tại
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng');
      }

      // Kiểm tra phòng tồn tại
      const room = await this.roomRepository.findOne({
        where: { id: roomId }
      });

      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng');
      }

      // Kiểm tra xem đã favorite chưa
      const existingFavorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          room: { id: roomId }
        }
      });

      if (existingFavorite) {
        throw new BadRequestException('Phòng đã có trong danh sách yêu thích');
      }

      // Create and save new favorite using save method with proper entity
      const favorite = new Favorite();
      favorite.user = user;
      favorite.room = room;
      
      const savedFavorite = await this.favoriteRepository.save(favorite);

      return {
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        data: savedFavorite
      };

    } catch (error) {
      throw error;
    }
  }

  async removeFavorite(userId: number, roomId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        room: { id: roomId }
      }
    });

    if (!favorite) {
      throw new NotFoundException('Không tìm thấy phòng trong danh sách yêu thích');
    }

    await this.favoriteRepository.remove(favorite);
    return { success: true, message: 'Đã xóa khỏi yêu thích' };
  }

  async getFavorites(userId: number) {
    try {
      const favorites = await this.favoriteRepository.find({
        where: { user: { id: userId } },
        relations: ['room', 'room.images', 'user'],
        order: { createdAt: 'DESC' }
      });
      
      // Extract just the rooms with their images
      return favorites.map(fav => ({
        id: fav.id,
        room: fav.room,
        isFavorite: true,
        createdAt: fav.createdAt
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể lấy danh sách yêu thích: ' + error.message
      );
    }
  }

  async getFavoritesCount(userId: number) {
    return this.favoriteRepository.count({
      where: { user: { id: userId } }
    });
  }

  async checkFavorite(userId: number, roomId: number) {
    try {
      console.log('Checking favorite for:', { userId, roomId });
      
      const favorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          room: { id: roomId }
        }
      });

      console.log('Found favorite:', favorite);
      
      return { isFavorite: !!favorite };
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw new InternalServerErrorException(
        'Không thể kiểm tra trạng thái yêu thích'
      );
    }
  }

  async removeFromFavorites(userId: number, roomId: number) {
    try {
      const result = await this.favoriteRepository.query(
        'DELETE FROM favorites WHERE userId = ? AND roomId = ?',
        [userId, roomId]
      );

      if (result.affectedRows === 0) {
        throw new NotFoundException('Không tìm thấy phòng trong danh sách yêu thích');
      }

      return {
        success: true,
        message: 'Đã xóa khỏi danh sách yêu thích'
      };
    } catch (error) {
      throw new InternalServerErrorException('Không thể xóa khỏi danh sách yêu thích');
    }
  }
}