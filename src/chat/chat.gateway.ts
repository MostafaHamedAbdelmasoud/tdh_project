import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../auth/socket-auth.middleware';
import { ChatService } from './chat.service';
import { Inject } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ConfigService } from '@nestjs/config';
/**
 * ChatGateway handles real-time chat events and connections.
 */
@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly rateLimiter = new RateLimiterMemory({
    points: 5, // 5 messages
    duration: 10, // per 10 seconds
    keyPrefix: 'room',
  });

  constructor(
    @Inject(ChatService) private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    // Apply authentication middleware to all connections
    server.use((socket, next) => {
      const middleware = new SocketAuthMiddleware(this.configService);
      middleware.use(socket as any, next);
    });
  }

  async handleConnection(client: Socket): Promise<void> {
    // Client is authenticated if connected
  }

  handleDisconnect(client: Socket): void {
    // Remove user from all rooms on disconnect
    const userId = (client as any).userId;
    const rooms = Array.from(client.rooms);
    rooms.forEach((roomId) => {
      if (roomId !== client.id) {
        this.chatService.removeUserFromRoom(roomId, userId);
        this.server
          .to(roomId)
          .emit('onlineUsers', this.chatService.getOnlineUsers(roomId));
      }
    });
  }

  /**
   * Create a new chat room.
   */
  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.chatService.createRoom(data.name);
    this.server.emit('roomCreated', room);
    return room;
  }

  /**
   * Join a chat room and get last 20 messages.
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId;
    client.join(data.roomId);
    this.chatService.addUserToRoom(data.roomId, userId);
    this.server
      .to(data.roomId)
      .emit('onlineUsers', this.chatService.getOnlineUsers(data.roomId));
    const messages = await this.chatService.getLastMessages(data.roomId, 20);
    client.emit('messageHistory', messages.reverse());
  }

  /**
   * Handle sending a message to a room with rate limiting.
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId;
    const key = `${data.roomId}:${userId}`;
    try {
      await this.rateLimiter.consume(key);
    } catch (err) {
      client.emit('rateLimitExceeded', {
        message: 'Rate limit exceeded: 5 messages per 10 seconds.',
      });
      return;
    }
    const message = await this.chatService.saveMessage({
      roomId: data.roomId,
      senderId: userId,
      content: data.content,
    });
    this.server.to(data.roomId).emit('newMessage', message);
  }

  /**
   * Handle sending a direct message (DM) between users.
   */
  @SubscribeMessage('sendDirectMessage')
  async handleSendDirectMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = (client as any).userId;
    const message = await this.chatService.sendDirectMessage(
      senderId,
      data.receiverId,
      data.content,
    );
    // Emit to sender and receiver if online
    client.emit('newDirectMessage', message);
    // Find all sockets for the receiver and emit
    for (const [id, socket] of this.server.sockets.sockets) {
      if ((socket as any).userId === data.receiverId) {
        socket.emit('newDirectMessage', message);
      }
    }
  }

  /**
   * Get DM history between two users (paginated, default 20).
   */
  @SubscribeMessage('getDirectMessages')
  async handleGetDirectMessages(
    @MessageBody() data: { userId: string; limit?: number; skip?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const myId = (client as any).userId;
    const messages = await this.chatService.getDirectMessages(
      myId,
      data.userId,
      data.limit || 20,
      data.skip || 0,
    );
    client.emit('directMessageHistory', messages.reverse());
  }

  /**
   * Get paginated message history for a room.
   */
  @SubscribeMessage('getRoomMessages')
  async handleGetRoomMessages(
    @MessageBody() data: { roomId: string; limit?: number; skip?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getLastMessages(
      data.roomId,
      data.limit || 20,
      data.skip || 0,
    );
    client.emit('roomMessageHistory', messages.reverse());
  }
}
