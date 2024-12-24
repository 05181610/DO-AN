import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadService } from '../upload/upload.service';
import { Room } from '../rooms/entities/room.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly uploadService: UploadService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email }
      });
      
      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Find user by email error:', error);
      throw error;
    }
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.avatar) {
      // Xử lý upload avatar
      user.avatar = await this.uploadService.uploadFile(updateProfileDto.avatar);
    }

    Object.assign(user, updateProfileDto);
    return this.userRepository.save(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    return this.userRepository.save(user);
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  async getUserStats(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['rooms', 'bookings', 'reviews'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      totalRooms: user.rooms?.length || 0,
      totalBookings: user.bookings?.length || 0,
      totalReviews: user.reviews?.length || 0,
      // Thêm các thống kê khác nếu cần
    };
  }

  async create(userData: RegisterDto) {
    const user = this.userRepository.create({
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
      fullName: userData.fullName,
      phone: userData.phone,
      role: userData.role
    });
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    try {
      console.log('Finding user with id:', id);
      const user = await this.userRepository.findOne({ 
        where: { id },
        select: ['id', 'email', 'fullName', 'role', 'avatar', 'phone', 'createdAt', 'updatedAt'] 
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async getDashboardStats(userId: number) {
    try {
      // Tổng số phòng đã đăng
      const totalRooms = await this.roomRepository.count({
        where: { userId }
      });

      // Tổng lượt xem
      const viewsResult = await this.roomRepository
        .createQueryBuilder('room')
        .select('SUM(room.views)', 'total')
        .where('room.userId = :userId', { userId })
        .getRawOne();
      
      const totalViews = parseInt(viewsResult?.total || '0');

      // Sửa lại cách đếm lượt yêu thích - đếm theo user.id
      const totalFavorites = await this.favoriteRepository
        .createQueryBuilder('favorite')
        .where('favorite.userId = :userId', { userId })
        .getCount();

      // Hoạt động gần đây
      const recentActivities = await this.getRecentActivities(userId);

      return {
        totalRooms,
        totalViews,
        totalFavorites,
        recentActivities
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw new InternalServerErrorException('Không thể lấy thống kê');
    }
  }

  private async getRecentActivities(userId: number) {
    const activities = [];

    // Lấy phòng mới đăng
    const recentRooms = await this.roomRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'title', 'createdAt']
    });

    activities.push(...recentRooms.map(room => ({
      type: 'post',
      description: `Đăng tin: ${room.title}`,
      createdAt: room.createdAt
    })));

    // Lấy yêu thích mới
    const recentFavorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['room'],
      order: { createdAt: 'DESC' },
      take: 5
    });

    activities.push(...recentFavorites.map(favorite => ({
      type: 'favorite',
      description: `Đã thích: ${favorite.room.title}`,
      createdAt: favorite.createdAt
    })));

    // Sắp xếp theo thời gian và lấy 5 hoạt động gần nhất
    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }

  async findUserRooms(userId: number) {
    return this.roomRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['images', 'user'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findFavoriteRooms(userId: number) {
    return this.roomRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['images', 'user'],
      order: {
        createdAt: 'DESC'
      }
    });
  }
}