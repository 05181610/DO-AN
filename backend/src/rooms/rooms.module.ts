import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { RoomImage } from './entities/room-image.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { FavoritesModule } from '../favorites/favorites.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { Review } from 'src/reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomImage, Favorite, Review]),
    FavoritesModule,
    ReviewsModule
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService]
})
export class RoomsModule {}