import { IsNotEmpty, IsNumber, IsString, IsISO8601, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  roomId: number;

  @IsISO8601()
  @IsNotEmpty()
  viewingDate: string;

  @IsString()
  @IsOptional()
  note?: string;
}