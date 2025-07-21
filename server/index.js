import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import streamRoutes from './routes/streamRoutes.js';
import streamerRoutes from './routes/streamerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import http from 'http';
import WebSocket from 'ws';
import nms from './services/rtmpServer.js';

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Initialize Express
const app = express();
const server1 = http.createServer(app)

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/streamers', streamerRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorHandler);

// Websocket server
const wss = new WebSocket.Server({ server: server1 });

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const path = req.url.split('?')[0];

  if (path.startsWith('/ws/broadcast')) {
    handleBroadcastWebSocket(wss, ws, req);
  }else if (path.startsWith('/ws/watch')) {
    handleWatchWebSocket(wss, ws, req);
  }else{
    ws.close(1000, 'Invalid WebSocket path');
  }

})
// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinStream', (streamId) => {
    socket.join(streamId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.streamId).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});