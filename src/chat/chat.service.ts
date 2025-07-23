import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './models/message.schema';
import { Room } from './models/room.schema';
import { User } from './models/user.schema';

/**
 * ChatService handles chat business logic: rooms, messages, DMs, and online users.
 */
@Injectable()
export class ChatService {
  private readonly onlineUsers: Map<string, Set<string>> = new Map(); // roomId -> Set<userId>

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Create a new chat room.
   */
  async createRoom(name: string): Promise<Room> {
    return this.roomModel.create({ name });
  }

  /**
   * Add user to a room's online user set.
   */
  addUserToRoom(roomId: string, userId: string): void {
    if (!this.onlineUsers.has(roomId)) {
      this.onlineUsers.set(roomId, new Set());
    }
    this.onlineUsers.get(roomId)!.add(userId);
  }

  /**
   * Remove user from a room's online user set.
   */
  removeUserFromRoom(roomId: string, userId: string): void {
    if (this.onlineUsers.has(roomId)) {
      this.onlineUsers.get(roomId)!.delete(userId);
      if (this.onlineUsers.get(roomId)!.size === 0) {
        this.onlineUsers.delete(roomId);
      }
    }
  }

  /**
   * Get online users for a room.
   */
  getOnlineUsers(roomId: string): string[] {
    return Array.from(this.onlineUsers.get(roomId) || []);
  }

  /**
   * Get the last N messages for a room (default 20), with optional skip for pagination.
   */
  async getLastMessages(roomId: string, limit = 20, skip = 0): Promise<Message[]> {
    return this.messageModel.find({ roomId }).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
  }

  /**
   * Save a message to the database.
   */
  async saveMessage(data: { roomId: string; senderId: string; content: string; receiverId?: string }): Promise<Message> {
    return this.messageModel.create({ ...data, timestamp: new Date() });
  }

  /**
   * Send a direct message (DM) between users.
   */
  async sendDirectMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    return this.saveMessage({ senderId, receiverId, content, roomId: '' });
  }

  /**
   * Get paginated DM history between two users.
   */
  async getDirectMessages(userA: string, userB: string, limit = 20, skip = 0): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Get all chat rooms.
   */
  async getAllRooms(): Promise<Room[]> {
    return this.roomModel.find().lean();
  }

  /**
   * Get all users.
   */
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().lean();
  }
} 