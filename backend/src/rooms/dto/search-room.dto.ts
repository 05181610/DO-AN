import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
export class SearchRoomDto {
    @IsOptional()
    keyword?: string;

    @IsOptional()
    district?: string;

    @IsOptional()
    priceRange?: string;

    @IsOptional()
    type?: string;

    @IsOptional()
    facilities?: string;
}