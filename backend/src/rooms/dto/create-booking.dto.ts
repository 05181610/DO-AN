import { IsNotEmpty, IsDateString, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsString()
  note?: string;
} 