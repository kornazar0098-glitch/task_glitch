const { Booking, Task, User } = require('../models');
const { Op } = require('sequelize');

// Create a new booking (worker applies for a task)
const createBooking = async (req, res) => {
  try {
    const { task_id, proposed_price, message } = req.body;

    if (!task_id || !proposed_price) {
      return res.status(400).json({ error: 'task_id و proposed_price الزامی است' });
    }

    // Check if task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ error: 'کار یافت نشد' });
    }

    // Check if task is still open
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'این کار دیگر برای درخواست باز نیست' });
    }

    // Check if worker already has a pending or accepted booking for this task
    const existingBooking = await Booking.findOne({
      where: {
        task_id,
        worker_id: req.user.userId,
        status: ['pending', 'accepted'],
      },
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'شما قبلاً برای این کار درخواست ثبت کرده‌اید' });
    }

    // Check if customer cannot book their own task
    if (task.customer_id === req.user.userId) {
      return res.status(400).json({ error: 'نمی‌توانید برای کار خود درخواست ثبت کنید' });
    }

    // Create booking
    const booking = await Booking.create({
      task_id,
      worker_id: req.user.userId,
      proposed_price,
      message: message || '',
      status: 'pending',
    });

    res.status(201).json({
      message: 'درخواست با موفقیت ثبت شد',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get all bookings for a task (for task owner)
const getTaskBookings = async (req, res) => {
  try {
    const { task_id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if task exists and belongs to user
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ error: 'کار یافت نشد' });
    }

    if (task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این کار ندارید' });
    }

    const where = { task_id };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'name', 'avatar', 'rating', 'bio', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      bookings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get task bookings error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get worker's bookings
const getWorkerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { worker_id: req.user.userId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'description', 'budget', 'location', 'category'],
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      bookings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get worker bookings error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Accept booking (customer accepts worker's request)
const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: {
        model: Task,
        as: 'task',
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is the task owner
    if (booking.task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    // Check if booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'این درخواست قابل تایید نیست' });
    }

    // Reject all other pending bookings for this task
    await Booking.update(
      { status: 'rejected', rejected_at: new Date() },
      {
        where: {
          task_id: booking.task_id,
          id: { [Op.ne]: id },
          status: 'pending',
        },
      }
    );

    // Accept this booking
    booking.status = 'accepted';
    booking.accepted_at = new Date();
    await booking.save();

    // Update task status to in_progress and assign worker
    const task = booking.task;
    task.status = 'in_progress';
    task.assigned_to = booking.worker_id;
    await task.save();

    res.status(200).json({
      message: 'درخواست با موفقیت تایید شد',
      booking,
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Reject booking
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: {
        model: Task,
        as: 'task',
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is the task owner
    if (booking.task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    // Check if booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'این درخواست قابل رد کردن نیست' });
    }

    booking.status = 'rejected';
    booking.rejected_at = new Date();
    await booking.save();

    res.status(200).json({
      message: 'درخواست با موفقیت رد شد',
      booking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Complete booking
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { task_id } = req.body;

    const booking = await Booking.findByPk(id, {
      include: {
        model: Task,
        as: 'task',
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is the task owner
    if (booking.task.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    // Check if booking is accepted
    if (booking.status !== 'accepted') {
      return res.status(400).json({ error: 'این درخواست قابل تکمیل کردن نیست' });
    }

    booking.status = 'completed';
    booking.completed_at = new Date();
    await booking.save();

    // Update task status to completed
    const task = booking.task;
    task.status = 'completed';
    await task.save();

    res.status(200).json({
      message: 'درخواست با موفقیت تکمیل شد',
      booking,
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Cancel booking (worker cancels their request)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is the worker
    if (booking.worker_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    // Check if booking can be cancelled
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({ error: 'این درخواست قابل لغو کردن نیست' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // If booking was accepted, update task status back to open
    if (booking.status === 'accepted') {
      const task = await Task.findByPk(booking.task_id);
      if (task) {
        task.status = 'open';
        task.assigned_to = null;
        await task.save();
      }
    }

    res.status(200).json({
      message: 'درخواست با موفقیت لغو شد',
      booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get booking details
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Task,
          as: 'task',
          include: {
            model: User,
            as: 'customer',
            attributes: ['id', 'name', 'avatar', 'rating', 'phone'],
          },
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'name', 'avatar', 'rating', 'phone'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is involved in this booking
    if (
      booking.worker_id !== req.user.userId &&
      booking.task.customer_id !== req.user.userId
    ) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

module.exports = {
  createBooking,
  getTaskBookings,
  getWorkerBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getBookingById,
};
