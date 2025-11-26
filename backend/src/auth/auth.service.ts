import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.log('Validating user: ' + email);
      
      const user = await this.userRepository.findOne({ 
        where: { email },
        select: ['id', 'email', 'password', 'fullName', 'role', 'avatar', 'phone'] 
      });
      
      this.logger.log('User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        this.logger.warn('User not found: ' + email);
        throw new UnauthorizedException('Email không tồn tại');
      }

      this.logger.log('Comparing password...');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      this.logger.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        this.logger.warn('Invalid password for user: ' + email);
        throw new UnauthorizedException('Mật khẩu không chính xác');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error('Validate user error:', error.message);
      throw error;
    }
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    };
  }

  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || 'tenant'
    });
    await this.userRepository.save(user);
    return this.login(user);
  }
}
