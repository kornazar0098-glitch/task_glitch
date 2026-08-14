const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const syncDatabase = require('./utils/database-sync');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Task Glitch API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Socket.io connection
const activeUsers = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // User joins with their user ID
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    activeUsers[userId] = socket.id;
    console.log(`User ${userId} joined`);
  });

  // Send message event
  socket.on('send_message', (data) => {
    const { booking_id, sender_id, receiver_id, content } = data;
    const message = {
      booking_id,
      sender_id,
      receiver_id,
      content,
      createdAt: new Date(),
    };

    // Send to receiver in real-time
    io.to(`user_${receiver_id}`).emit('receive_message', message);
    console.log(`Message from ${sender_id} to ${receiver_id}: ${content}`);
  });

  // User is typing
  socket.on('user_typing', (data) => {
    const { booking_id, receiver_id, sender_id } = data;
    io.to(`user_${receiver_id}`).emit('user_typing', {
      booking_id,
      sender_id,
    });
  });

  // User stopped typing
  socket.on('user_stop_typing', (data) => {
    const { booking_id, receiver_id, sender_id } = data;
    io.to(`user_${receiver_id}`).emit('user_stop_typing', {
      booking_id,
      sender_id,
    });
  });

  // Message read event
  socket.on('message_read', (data) => {
    const { booking_id, reader_id, sender_id } = data;
    io.to(`user_${sender_id}`).emit('message_read', {
      booking_id,
      reader_id,
    });
  });

  // User disconnect
  socket.on('disconnect', () => {
    Object.keys(activeUsers).forEach((userId) => {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'خطای سرور' });
});

// Start server and sync database
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await syncDatabase();
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
