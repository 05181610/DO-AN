import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone: string;

  @IsEnum(['tenant', 'landlord'])
  role: string;
} 