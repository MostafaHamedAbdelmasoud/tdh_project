import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SocketAuthMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(socket: Socket, next: (err?: any) => void): void {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const secret = this.configService.get<string>('JWT_SECRET', { infer: true });
    if (!secret) {
      return next(new Error('JWT_SECRET not set'));
    }

    try {
      const payload = jwt.verify(token, secret);
      if (typeof payload === 'object' && 'userId' in payload) {
        (socket as any).userId = (payload as any).userId;
        return next();
      } else {
        return next(new Error('Invalid token payload'));
      }
    } catch {
      return next(new Error('Invalid token'));
    }
  }
}