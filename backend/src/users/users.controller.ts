import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    try {
      console.log('Request headers:', req.headers);
      console.log('User from request:', req.user);
      console.log('User ID:', req.user.id);
      const user = await this.usersService.findById(req.user.id);
      console.log('User found:', user);
      return user;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(@Request() req) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Mật khẩu mới không khớp');
    }
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Put('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }

  @Get('stats')
  getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }
}   