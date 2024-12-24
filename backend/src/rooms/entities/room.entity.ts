import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoomImage } from './room-image.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  price: number;

  @Column()
  area: number;

  @Column()
  location: string;

  @Column()
  district: string;

  @Column()
  type: string;

  @Column('simple-array')
  facilities: string[];

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.rooms)
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => RoomImage, image => image.room, { cascade: true })
  images: RoomImage[];

  @OneToMany(() => Booking, booking => booking.room)
  bookings: Booking[];

  @OneToMany(() => Review, review => review.room)
  reviews: Review[];

  @OneToMany(() => Favorite, favorite => favorite.room)
  favorites: Favorite[];

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  favoriteCount: number;

  @Column({ default: 0 })
  bookingCount: number;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  averageRating: number;
}
