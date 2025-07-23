import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Room } from './models/room.schema';
import { User } from './models/user.schema';

/**
 * ChatController provides HTTP endpoints for room and user listing.
 */
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get all chat rooms.
   */
  @Get('rooms')
  async getRooms(): Promise<Room[]> {
    return this.chatService.getAllRooms();
  }

  /**
   * Get all users.
   */
  @Get('users')
  async getUsers(): Promise<User[]> {
    return this.chatService.getAllUsers();
  }
} 