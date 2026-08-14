const { Review, Booking, User, Task } = require('../models');
const { Op } = require('sequelize');

// Create a review
const createReview = async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating) {
      return res.status(400).json({ error: 'booking_id و rating الزامی است' });
    }

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id, {
      include: {
        model: Task,
        as: 'task',
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'درخواست یافت نشد' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'فقط درخواست‌های تکمیل‌شده می‌توانند نظر داشته باشند' });
    }

    // Check if user is either customer or worker
    let reviewedUserId;
    let reviewType;

    if (req.user.userId === booking.task.customer_id) {
      // Customer reviewing worker
      reviewedUserId = booking.worker_id;
      reviewType = 'worker';
    } else if (req.user.userId === booking.worker_id) {
      // Worker reviewing customer
      reviewedUserId = booking.task.customer_id;
      reviewType = 'customer';
    } else {
      return res.status(403).json({ error: 'شما دسترسی به این درخواست ندارید' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: {
        booking_id,
        reviewer_id: req.user.userId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'شما قبلاً برای این درخواست نظر ثبت کرده‌اید' });
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ error: 'امتیاز باید بین 1 تا 5 باشد' });
    }

    // Create review
    const review = await Review.create({
      booking_id,
      reviewer_id: req.user.userId,
      reviewed_user_id: reviewedUserId,
      rating,
      comment: comment || '',
      review_type: reviewType,
    });

    // Update user rating
    const reviewedUser = await User.findByPk(reviewedUserId);
    if (reviewedUser) {
      // Get all reviews for this user
      const allReviews = await Review.findAll({
        where: { reviewed_user_id: reviewedUserId },
      });

      // Calculate average rating
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      reviewedUser.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
      reviewedUser.total_reviews = allReviews.length;
      await reviewedUser.save();
    }

    res.status(201).json({
      message: 'نظر با موفقیت ثبت شد',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { review_type, page = 1, limit = 10 } = req.query;

    const where = { reviewed_user_id: user_id };

    if (review_type) {
      if (!['worker', 'customer'].includes(review_type)) {
        return res.status(400).json({ error: 'نوع نظر معتبر نیست' });
      }
      where.review_type = review_type;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      reviews: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get reviews given by a user
const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: { reviewer_id: req.user.userId },
      include: [
        {
          model: User,
          as: 'reviewed_user',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'task_id'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      reviews: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Get single review
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
        {
          model: User,
          as: 'reviewed_user',
          attributes: ['id', 'name', 'avatar', 'rating'],
        },
        {
          model: Booking,
          as: 'booking',
          include: {
            model: Task,
            as: 'task',
            attributes: ['id', 'title'],
          },
        },
      ],
    });

    if (!review) {
      return res.status(404).json({ error: 'نظر یافت نشد' });
    }

    res.status(200).json({ review });
  } catch (error) {
    console.error('Get review by id error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Update review (only reviewer can update)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ error: 'نظر یافت نشد' });
    }

    // Check if user is the reviewer
    if (review.reviewer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این نظر ندارید' });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res.status(400).json({ error: 'امتیاز باید بین 1 تا 5 باشد' });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Recalculate user rating
    const allReviews = await Review.findAll({
      where: { reviewed_user_id: review.reviewed_user_id },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    const reviewedUser = await User.findByPk(review.reviewed_user_id);
    reviewedUser.rating = Math.round(averageRating * 10) / 10;
    reviewedUser.total_reviews = allReviews.length;
    await reviewedUser.save();

    res.status(200).json({
      message: 'نظر با موفقیت بروزرسانی شد',
      review,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ error: 'نظر یافت نشد' });
    }

    // Check if user is the reviewer
    if (review.reviewer_id !== req.user.userId) {
      return res.status(403).json({ error: 'شما دسترسی به این نظر ندارید' });
    }

    const reviewedUserId = review.reviewed_user_id;

    await review.destroy();

    // Recalculate user rating
    const allReviews = await Review.findAll({
      where: { reviewed_user_id: reviewedUserId },
    });

    const reviewedUser = await User.findByPk(reviewedUserId);
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;
      reviewedUser.rating = Math.round(averageRating * 10) / 10;
    } else {
      reviewedUser.rating = 0;
    }
    reviewedUser.total_reviews = allReviews.length;
    await reviewedUser.save();

    res.status(200).json({
      message: 'نظر با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'خطای سرور' });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
