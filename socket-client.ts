import { io, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: 'user1' }, 'dummy_secret');
console.log(token);
const socket: Socket = io('http://127.0.0.1:3000', { auth: { token } });

const roomId = '687e66612a35ff3979b1a0fc'; // Replace with your actual room ID

socket.on('connect', () => {
  socket.emit('joinRoom', { roomId });
  socket.emit('sendMessage', {
    roomId,
    content: 'Hello from TypeScript client!',
  });
});

socket.on('newMessage', (msg: any) => {
  console.log('New message:', msg);
});
