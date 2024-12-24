import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
export class CreateUserDto {
 @IsNotEmpty()
 @IsString()
 fullName: string;
  @IsEmail()
 email: string;
  @IsNotEmpty()
 @IsString()
 @MinLength(6)
 password: string;
  @IsNotEmpty()
 @IsString()
 phone: string;
  @IsEnum(['tenant', 'landlord'])
 userType: string;
}