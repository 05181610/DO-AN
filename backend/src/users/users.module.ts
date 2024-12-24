import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { UploadModule } from '../upload/upload.module';
import { Favorite } from '../favorites/entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Room, Favorite]),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
