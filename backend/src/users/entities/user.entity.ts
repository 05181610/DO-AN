import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Message } from '../../messages/entities/message.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: ['tenant', 'landlord'],
    default: 'tenant'
  })
  role: string;

  @OneToMany(() => Room, room => room.user)
  rooms: Room[];

  @OneToMany(() => Booking, booking => booking.user)
  bookings: Booking[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites: Favorite[];
}
