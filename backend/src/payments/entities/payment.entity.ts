import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Room)
  room: Room;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column()
  transactionId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @CreateDateColumn()
  createdAt: Date;
} 