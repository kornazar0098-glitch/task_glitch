const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id',
    },
  },
  worker_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  proposed_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
    defaultValue: 'pending',
  },
  accepted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'bookings',
});

module.exports = Booking;
