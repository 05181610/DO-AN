import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      this.logger.log('Login attempt for email: ' + loginDto.email);
      
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password
      );
      
      this.logger.log('User validated successfully');
      
      return this.authService.login(user);
    } catch (error) {
      this.logger.error('Login error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }
}