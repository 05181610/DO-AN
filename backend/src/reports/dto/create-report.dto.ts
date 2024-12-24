import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  roomId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  description: string;
} 