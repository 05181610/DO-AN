import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @Column()
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.reviews)
  user: User;

  @ManyToOne(() => Room, room => room.reviews)
  room: Room;
}