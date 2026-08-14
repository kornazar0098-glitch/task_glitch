const { Task, User, Booking } = require('../models');
const { Op } = require('sequelize');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, category, budget, location, latitude, longitude, deadline, images } = req.body;

    // Validation
    if (!title || !description || !category || !budget || !location || !deadline) {
      return res.status(400).json({ error: 'تمام فیلدهای الزامی را پر کنید' });
    }

    const task = await Task.create({
      customer_id: req.user.userId,
      title,
      description,
      category,
      budget,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      deadline,
      images: images || [],
      status: 'open',
    });

    res.status(201).json({
      message: 'کار با موفقیت ثبت شد',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get all tasks with filtering
const getTasks = async (req, res) => {
  try {
    const { category, status, location, minBudget, maxBudget, search, page = 1, limit = 10 } = req.query;

    const where = {};

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by location
    if (location) {
      where.location = {
        [Op.iLike]: `%${location}%`,
      };
    }

    // Filter by budget range
    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget[Op.gte] = minBudget;
      if (maxBudget) where.budget[Op.lte] = maxBudget;
    }

    // Search in title and description
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      tasks: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get single task details
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'avatar', 'rating', 'bio', 'phone'],
        },
        {
          model: Booking,
          as: 'bookings',
          where: { status: ['pending', 'accepted'] },
          required: false,
          include: [
            {
              model: User,
              as: 'worker',
              attributes: ['id', 'name', 'avatar', 'rating'],
            },
          ],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'کار یافت نشد' });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error('Get task by id error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get user's tasks
const getUserTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { customer_id: req.user.userId };

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: Booking,
          as: 'bookings',
          attributes: ['id', 'worker_id', 'proposed_price', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      tasks: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, budget, location, deadline, status } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'کار یافت نشد' });
    }

    // Check ownership
    if (task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این کار ندارید' });
    }

    // Can only update if status is open
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'فقط کارهای باز می‌توانند ویرایش شوند' });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (category) task.category = category;
    if (budget) task.budget = budget;
    if (location) task.location = location;
    if (deadline) task.deadline = deadline;
    if (status) task.status = status;

    await task.save();

    res.status(200).json({
      message: 'کار با موفقیت بروزرسانی شد',
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Cancel task
const cancelTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'کار یافت نشد' });
    }

    // Check ownership
    if (task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این کار ندارید' });
    }

    // Can only cancel if status is open or in_progress
    if (!['open', 'in_progress'].includes(task.status)) {
      return res.status(400).json({ error: 'این کار نمی‌تواند لغو شود' });
    }

    task.status = 'cancelled';
    await task.save();

    res.status(200).json({
      message: 'کار با موفقیت لغو شد',
      task,
    });
  } catch (error) {
    console.error('Cancel task error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'کار یافت نشد' });
    }

    // Check ownership
    if (task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این کار ندارید' });
    }

    // Can only delete if status is open
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'فقط کارهای باز می‌توانند حذف شوند' });
    }

    await task.destroy();

    res.status(200).json({
      message: 'کار با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get nearby tasks (based on latitude/longitude)
const getNearbyTasks = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, page = 1, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude و longitude الزامی است' });
    }

    const offset = (page - 1) * limit;

    // Simple distance calculation using Haversine formula (in km)
    // For production, use PostGIS extension for better performance
    const tasks = await Task.findAll({
      where: {
        status: 'open',
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
      },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Filter by distance
    const filteredTasks = tasks.filter((task) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((task.latitude - latitude) * Math.PI) / 180;
      const dLon = ((task.longitude - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((task.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= radius;
    });

    res.status(200).json({
      tasks: filteredTasks,
      pagination: {
        total: filteredTasks.length,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get nearby tasks error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  getUserTasks,
  updateTask,
  cancelTask,
  deleteTask,
  getNearbyTasks,
};
