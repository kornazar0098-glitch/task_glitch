const { Message, User, Booking } = require('../models');
const { Op } = require('sequelize');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { booking_id, receiver_id, content } = req.body;

    if (!booking_id || !receiver_id || !content) {
      return res.status(400).json({ error: 'booking_id، receiver_id و content الزامی است' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'پیام نمی‌تواند خالی باشد' });
    }

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is part of this booking
    if (req.user.userId !== booking.worker_id && req.user.userId !== booking.task.customer_id) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    // Check if receiver is valid
    if (receiver_id === req.user.userId) {
      return res.status(400).json({ error: 'نمی‌توانید برای خود پیام ارسال کنید' });
    }

    // Verify receiver is part of the booking
    if (receiver_id !== booking.worker_id && receiver_id !== booking.task.customer_id) {
      return res.status(400).json({ error: 'گیرنده باید در این درخواست باشد' });
    }

    // Create message
    const message = await Message.create({
      booking_id,
      sender_id: req.user.userId,
      receiver_id,
      content: content.trim(),
      is_read: false,
    });

    // Fetch message with sender info
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    res.status(201).json({
      message: 'پیام با موفقیت ارسال شد',
      data: fullMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get messages for a booking
const getBookingMessages = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id, {
      include: {
        model: Message,
        as: 'messages',
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is part of this booking
    if (req.user.userId !== booking.worker_id && req.user.userId !== booking.task.customer_id) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: { booking_id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Mark unread messages as read for current user
    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          booking_id,
          receiver_id: req.user.userId,
          is_read: false,
        },
      }
    );

    res.status(200).json({
      messages: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get booking messages error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get conversations (list of bookings with last message)
const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Get bookings where user is involved
    const bookings = await Booking.findAll({
      where: {
        [Op.or]: [
          { worker_id: req.user.userId },
          { '$task.customer_id$': req.user.userId },
        ],
      },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'customer_id'],
        },
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          separate: true,
        },
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false,
      raw: false,
    });

    // Get count
    const count = await Booking.count({
      where: {
        [Op.or]: [
          { worker_id: req.user.userId },
          { '$task.customer_id$': req.user.userId },
        ],
      },
      distinct: true,
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id'],
        },
      ],
    });

    // Get unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
      bookings.map(async (booking) => {
        const unreadCount = await Message.count({
          where: {
            booking_id: booking.id,
            receiver_id: req.user.userId,
            is_read: false,
          },
        });
        return {
          ...booking.toJSON(),
          unread_count: unreadCount,
        };
      })
    );

    res.status(200).json({
      conversations: conversationsWithUnread,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'پیام یافت نشد' });
    }

    // Check if user is receiver
    if (message.receiver_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این پیام ندارید' });
    }

    message.is_read = true;
    message.read_at = new Date();
    await message.save();

    res.status(200).json({
      message: 'پیام به عنوان خوانده شده علامت‌گذاری شد',
      data: message,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Mark all messages as read for a booking
const markAllAsRead = async (req, res) => {
  try {
    const { booking_id } = req.params;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if user is part of this booking
    if (req.user.userId !== booking.worker_id && req.user.userId !== booking.task.customer_id) {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          booking_id,
          receiver_id: req.user.userId,
          is_read: false,
        },
      }
    );

    res.status(200).json({
      message: 'تمام پیام‌ها به عنوان خوانده شده علامت‌گذاری شدند',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.count({
      where: {
        receiver_id: req.user.userId,
        is_read: false,
      },
    });

    res.status(200).json({
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

module.exports = {
  sendMessage,
  getBookingMessages,
  getConversations,
  markMessageAsRead,
  markAllAsRead,
  getUnreadCount,
};
