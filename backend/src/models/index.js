const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Booking = require('./Booking');
const Review = require('./Review');
const Payment = require('./Payment');
const Message = require('./Message');

// Define associations

// User associations
User.hasMany(Task, { foreignKey: 'customer_id', as: 'tasks_created' });
User.hasMany(Booking, { foreignKey: 'worker_id', as: 'bookings' });
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'reviews_given' });
User.hasMany(Review, { foreignKey: 'reviewed_user_id', as: 'reviews_received' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'messages_sent' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'messages_received' });
User.hasMany(Payment, { foreignKey: 'customer_id', as: 'payments_made' });
User.hasMany(Payment, { foreignKey: 'worker_id', as: 'payments_received' });

// Task associations
Task.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Task.hasMany(Booking, { foreignKey: 'task_id', as: 'bookings' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assigned_worker' });

// Booking associations
Booking.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Booking.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });
Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
Booking.hasMany(Message, { foreignKey: 'booking_id', as: 'messages' });

// Review associations
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewed_user_id', as: 'reviewed_user' });

// Payment associations
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Payment.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Payment.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

// Message associations
Message.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

module.exports = {
  sequelize,
  User,
  Task,
  Booking,
  Review,
  Payment,
  Message,
};
