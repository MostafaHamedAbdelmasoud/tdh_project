"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
var jsonwebtoken_1 = require("jsonwebtoken");
var token = jsonwebtoken_1.default.sign({ userId: 'user1' }, 'dummy_secret');
var socket = (0, socket_io_client_1.io)('http://localhost:3000', { auth: { token: token } });
var roomId = 'ROOM_ID'; // Replace with your actual room ID
socket.on('connect', function () {
    socket.emit('joinRoom', { roomId: roomId });
    socket.emit('sendMessage', { roomId: roomId, content: 'Hello from TypeScript client!' });
});
socket.on('newMessage', function (msg) {
    console.log('New message:', msg);
});
