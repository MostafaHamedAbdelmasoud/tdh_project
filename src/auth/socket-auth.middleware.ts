import { Injectable, NestMiddleware } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate Socket.IO connections using a dummy JWT.
 */
@Injectable()
export class SocketAuthMiddleware implements NestMiddleware {
  use(socket: Socket, next: (err?: any) => void): void {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    try {
      // Dummy secret and verification for demonstration
      const payload = jwt.verify(token, 'dummy_secret');
      if (typeof payload === 'object' && payload && 'userId' in payload) {
        (socket as any).userId = (payload as any).userId;
        next();
      } else {
        next(new Error('Invalid token payload'));
      }
    } catch (err) {
      next(new Error('Invalid token'));
    }
  }
} 