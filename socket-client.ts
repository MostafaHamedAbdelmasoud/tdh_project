import { io, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // load .env variables

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET is not defined in .env');
}

const token = jwt.sign({ userId: 'user1' }, secret);
console.log('Generated token:', token);

const socket: Socket = io('http://127.0.0.1:3000', { auth: { token } });

const roomId = '687e66612a35ff3979b1a0fc'; // Replace with your actual room ID

socket.on('connect', () => {
  socket.emit('joinRoom', { roomId });
  socket.emit('sendMessage', {
    roomId,
    content: 'Hello from TypeScript client3!',
  });
});

socket.on('newMessage', (msg: any) => {
  console.log('New message:', msg);
});