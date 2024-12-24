import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Room, { eager: true })
  room: Room;

  @Column({ 
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  viewingDate: Date;

  @Column({ nullable: true })
  note: string;

  @Column({ 
    default: 'pending',
    length: 20
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
