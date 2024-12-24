import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

@Entity('room_image')
export class RoomImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Room, room => room.images, { onDelete: 'CASCADE' })
  room: Room;

  @Column()
  roomId: number;
} 