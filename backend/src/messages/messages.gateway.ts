import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173'
  }
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.join(`user_${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    client.leave(`user_${client.data.userId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { receiverId: number, content: string }) {
    const message = await this.messagesService.create({
      senderId: client.data.userId,
      receiverId: payload.receiverId,
      content: payload.content
    });

    this.server.to(`user_${payload.receiverId}`).emit('newMessage', message);
    return message;
  }
} 