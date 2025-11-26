import { Injectable, NotFoundException, Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomImage } from './entities/room-image.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Review } from '../reviews/entities/review.entity';
import { SearchRoomDto } from './dto/search-room.dto';
import { Favorite } from '../favorites/entities/favorite.entity';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomImage)
    private readonly roomImageRepository: Repository<RoomImage>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>
  ) {}

  async findAll(queryParams: any) {
    try {
      const query = this.roomRepository.createQueryBuilder('room')
        .leftJoinAndSelect('room.images', 'images')
        .leftJoinAndSelect('room.user', 'user');

      if (queryParams.search) {
        query.andWhere(
          new Brackets(qb => {
            qb.where('room.title LIKE :search', { search: `%${queryParams.search}%` })
              .orWhere('room.description LIKE :search', { search: `%${queryParams.search}%` });
          })
        );
      }

      if (queryParams.district) {
        query.andWhere('room.district = :district', { 
          district: queryParams.district 
        });
      }

      if (queryParams.priceRange) {
        const [min, max] = queryParams.priceRange.split('-').map(Number);
        query.andWhere('room.price >= :min AND room.price <= :max', 
          { min: min * 1000000, max: max * 1000000 }
        );
      }

      if (queryParams.type) {
        query.andWhere('room.type = :type', { type: queryParams.type });
      }

      const [items, total] = await query.getManyAndCount();

      return {
        items,
        meta: {
          total,
          page: Number(queryParams.page) || 1,
          limit: Number(queryParams.limit) || 10,
          totalPages: Math.ceil(total / (Number(queryParams.limit) || 10))
        }
      };
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`);
      throw new InternalServerErrorException('Không thể lấy danh sách phòng');
    }
  }

  async getFeatured() {
    try {
      const rooms = await this.roomRepository.find({
        relations: ['images', 'user'],
        order: { views: 'DESC' },
        take: 6,
      });
      return rooms;
    } catch (error) {
      this.logger.error('Error getting featured rooms:', error);
      throw error;
    }
  }

  async getLatest() {
    try {
      const rooms = await this.roomRepository.find({
        relations: ['images', 'user'],
        order: { createdAt: 'DESC' },
        take: 6,
      });
      return rooms;
    } catch (error) {
      this.logger.error('Error getting latest rooms:', error);
      throw error;
    }
  }

  async getMyRooms(userId: number) {
    return this.roomRepository.find({
      where: { user: { id: userId } },
      relations: ['images'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['user', 'images']
    });

    if (!room) {
      throw new NotFoundException('Phòng không tồn tại');
    }

    await this.roomRepository.update(id, {
      views: () => 'views + 1'
    });

    return room;
  }

  private async handleRoomImages(room: Room, imageUrls: string[]) {
    if (room.id) {
      await this.roomImageRepository.delete({ roomId: room.id });
    }

    if (imageUrls && imageUrls.length > 0) {
      const roomImages = imageUrls.map(url => 
        this.roomImageRepository.create({
          url,
          room,
          roomId: room.id
        })
      );
      await this.roomImageRepository.save(roomImages);
    }
  }

  async create(createRoomDto: CreateRoomDto, userId: number) {
    try {
      const room = this.roomRepository.create({
        title: createRoomDto.title,
        description: createRoomDto.description,
        price: createRoomDto.price,
        area: createRoomDto.area,
        location: createRoomDto.location,
        district: createRoomDto.district,
        type: createRoomDto.type,
        facilities: createRoomDto.facilities,
        user: { id: userId },
        images: createRoomDto.images.map(url => ({
          url: url
        }))
      });

      const savedRoom = await this.roomRepository.save(room);

      return this.findOne(savedRoom.id);
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async update(id: number, updateRoomDto: UpdateRoomDto, userId: number) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: ['user', 'images']
      });

      if (!room) {
        throw new NotFoundException('Không tìm thấy phòng');
      }

      if (room.user.id !== userId) {
        throw new UnauthorizedException('Không có quyền cập nhật phòng này');
      }

      await this.roomRepository.update(id, {
        title: updateRoomDto.title,
        description: updateRoomDto.description,
        price: updateRoomDto.price,
        area: updateRoomDto.area,
        location: updateRoomDto.location,
        district: updateRoomDto.district,
        type: updateRoomDto.type,
        facilities: updateRoomDto.facilities
      });

      if (updateRoomDto.images) {
        await this.handleRoomImages(room, updateRoomDto.images);
      }

      return this.findOne(id);
    } catch (error) {
      this.logger.error('Error updating room:', error);
      throw error;
    }
  }

  async remove(id: number, userId: number) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.user.id !== userId) {
      throw new UnauthorizedException('Not authorized to delete this room');
    }

    await this.roomRepository.remove(room);
    return { message: 'Room deleted successfully' };
  }

  async getRoomReviews(roomId: number) {
    try {
      const reviews = await this.reviewRepository.find({
        where: { room: { id: roomId } },
        relations: ['user'],
        order: { createdAt: 'DESC' }
      });

      return reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.user.id,
          fullName: review.user.fullName,
          avatar: review.user.avatar
        }
      }));
    } catch (error) {
      console.error('Error getting room reviews:', error);
      throw error;
    }
  }

  async search(searchParams: SearchRoomDto) {
    const query = this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.images', 'images')
      .leftJoinAndSelect('room.user', 'user');

    if (searchParams.priceRange) {
      const [min, max] = searchParams.priceRange.split('-');
      query.andWhere('room.price BETWEEN :min AND :max', { min, max });
    }

    if (searchParams.district) {
      query.andWhere('room.district = :district', { district: searchParams.district });
    }

    if (searchParams.type) {
      query.andWhere('room.type = :type', { type: searchParams.type });
    }

    if (searchParams.facilities) {
      query.andWhere('room.facilities LIKE :facilities', { 
        facilities: `%${searchParams.facilities}%` 
      });
    }

    return query.getMany();
  }

  async toggleFavorite(roomId: number, userId: number) {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId }
      });

      if (!room) {
        throw new NotFoundException('Phòng không tồn tại');
      }

      const existingFavorite = await this.favoriteRepository.findOne({
        where: {
          user: { id: userId },
          room: { id: roomId }
        }
      });

      if (existingFavorite) {
        await this.favoriteRepository.remove(existingFavorite);
        return { isFavorite: false };
      } else {
        const favorite = this.favoriteRepository.create({
          user: { id: userId },
          room: { id: roomId }
        });
        await this.favoriteRepository.save(favorite);
        return { isFavorite: true };
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      throw new InternalServerErrorException('Không thể thực hiện thao tác này');
    }
  }

  async checkFavorite(roomId: number, userId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        room: { id: roomId }
      }
    });
    return { isFavorite: !!favorite };
  }
}