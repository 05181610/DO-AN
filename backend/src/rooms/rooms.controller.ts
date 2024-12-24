import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Query, 
  Param, 
  Body,
  UseGuards,
  Request,
  DefaultValuePipe, 
  ParseIntPipe,
  NotFoundException,
  Logger,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { FavoritesService } from '../favorites/favorites.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SearchRoomDto } from './dto/search-room.dto';

@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(
    private readonly roomsService: RoomsService,
    private readonly favoritesService: FavoritesService
  ) {}

  @Get()
  async findAll(
    @Query() query: SearchRoomDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      return await this.roomsService.findAll({ ...query, page, limit });
    } catch (error) {
      this.logger.error(`Error in findAll: ${error.message}`);
      throw error;
    }
  }

  @Get('featured')
  getFeatured() {
    return this.roomsService.getFeatured();
  }

  @Get('latest')
  getLatest() {
    return this.roomsService.getLatest();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-rooms')
  async getMyRooms(@Request() req) {
    return this.roomsService.getMyRooms(req.user.id);
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching room with id: ${id}`);
      const room = await this.roomsService.findOne(+id);
      
      if (!room) {
        this.logger.warn(`Room with id ${id} not found`);
        throw new NotFoundException('Phòng không tồn tại');
      }
      
      return room;
    } catch (error) {
      this.logger.error(`Error fetching room ${id}:`, error);
      throw error;
    }
  }

  @Get(':id/reviews')
  async getRoomReviews(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      console.log('Getting reviews for room:', id);
      const reviews = await this.roomsService.getRoomReviews(id);
      return reviews;
    } catch (error) {
      console.error('Error in getRoomReviews:', error);
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    try {
      return await this.roomsService.create(createRoomDto, req.user.id);
    } catch (error) {
      this.logger.error(`Error in create: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req
  ) {
    return this.roomsService.update(id, updateRoomDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/favorite')
  async checkFavorite(@Request() req, @Param('id') id: string) {
    const isFavorite = await this.favoritesService.checkFavorite(
      req.user.id,
      +id
    );
    return isFavorite;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addFavorite(@Request() req, @Param('id') id: string) {
    return this.favoritesService.addToFavorites(req.user.id, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(@Request() req, @Param('id') id: string) {
    return this.favoritesService.removeFavorite(req.user.id, +id);
  }

  @Post('upload-images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      console.log('Received files:', files);
      const imageUrls = files.map(file => file.filename);
      console.log('Generated URLs:', imageUrls);
      return { urls: imageUrls };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}