# Scalable Multi-Room Chat System (NestJS, Socket.IO, MongoDB)

## Features
- Real-time messaging with Socket.IO
- Dynamic room creation and joining
- Private messages (DMs) between users
- Message storage in MongoDB (Mongoose)
- Last 20 messages shown on room join, with pagination for history
- Online users tracked per room in real-time
- Rate limiting: 5 messages/10 seconds per user per room
- Socket.IO authentication via dummy JWT
- REST API for room and user listing

## Architecture
- **NestJS** modular structure: `chat`, `auth`, `core`, `shared`
- **Socket.IO Gateway** for real-time events
- **Mongoose** for MongoDB integration and schemas
- **Rate-limiter-flexible** for per-user-per-room rate limiting

## Setup
1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```
2. **Start MongoDB** (default URI: `mongodb://localhost:27017/tdh-chat`)
3. **Run the server:**
   ```bash
   npm run start:dev
   ```

## Usage
### Socket.IO Events
- `createRoom` — Create a new room `{ name }`
- `joinRoom` — Join a room `{ roomId }`
- `sendMessage` — Send message to room `{ roomId, content }`
- `sendDirectMessage` — Send DM `{ receiverId, content }`
- `getRoomMessages` — Paginated room history `{ roomId, limit, skip }`
- `getDirectMessages` — Paginated DM history `{ userId, limit, skip }`

#### Authentication
- Pass a JWT token with `{ userId }` in the payload, signed with secret `dummy_secret`:
  ```js
  const token = jwt.sign({ userId: 'user1' }, 'dummy_secret');
  socket.auth = { token };
  ```

### REST API
- `GET /rooms` — List all rooms
- `GET /users` — List all users

#### Example curl
```bash
curl http://localhost:3000/rooms
curl http://localhost:3000/users
```

## Testing
- **Run e2e tests:**
  ```bash
  npm run test:e2e
  ```
- Tests check that `/rooms` and `/users` endpoints return arrays (see `server/test/app.e2e-spec.ts`).

## Notes
- For production, replace the dummy JWT logic with real authentication.
- See code for more Socket.IO event details and payloads.