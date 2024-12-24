import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async sendMessage(senderId: number, receiverId: number, content: string) {
    const message = this.messageRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      content
    });
    return this.messageRepository.save(message);
  }

  async getConversation(userId: number, otherUserId: number) {
    return this.messageRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: otherUserId } },
        { sender: { id: otherUserId }, receiver: { id: userId } }
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async create(data: { senderId: number; receiverId: number; content: string }) {
    const message = this.messageRepository.create({
      sender: { id: data.senderId },
      receiver: { id: data.receiverId },
      content: data.content
    });
    return this.messageRepository.save(message);
  }
} 