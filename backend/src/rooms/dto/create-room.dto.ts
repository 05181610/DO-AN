import { IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  area: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  district: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  facilities: string[];

  @IsArray()
  @IsString({ each: true })
  images: string[];
}