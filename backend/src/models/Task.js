const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'shopping',
      'delivery',
      'cleaning',
      'handyman',
      'moving',
      'pet-care',
      'personal-errands',
      'other'
    ),
    allowNull: false,
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'open',
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  tableName: 'tasks',
});

module.exports = Task;
