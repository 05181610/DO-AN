// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { UseGuards } from '@nestjs/common';
// import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
// import { ChatService } from './chat.service';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private connectedUsers = new Map<number, string>();

//   constructor(private readonly chatService: ChatService) {}

//   @UseGuards(WsJwtGuard)
//   async handleConnection(client: Socket) {
//     const userId = client.data.user.id;
//     this.connectedUsers.set(userId, client.id);
//   }

//   handleDisconnect(client: Socket) {
//     const userId = client.data.user.id;
//     this.connectedUsers.delete(userId);
//   }

//   @SubscribeMessage('sendMessage')
//   async handleMessage(client: Socket, payload: { receiverId: number; content: string; roomId?: number }) {
//     const senderId = client.data.user.id;
//     const message = await this.chatService.createMessage({
//       senderId,
//       receiverId: payload.receiverId,
//       content: payload.content,
//       roomId: payload.roomId,
//     });

//     const receiverSocketId = this.connectedUsers.get(payload.receiverId);
//     if (receiverSocketId) {
//       this.server.to(receiverSocketId).emit('newMessage', message);
//     }

//     return message;
//   }
// } 