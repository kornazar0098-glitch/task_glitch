const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateReview, validateUpdateReview } = require('../middleware/reviewValidation');

// Public routes
router.get('/user/:user_id', reviewController.getUserReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes
router.post('/', authMiddleware, validateCreateReview, reviewController.createReview);
router.get('/my/reviews', authMiddleware, reviewController.getMyReviews);
router.put('/:id', authMiddleware, validateUpdateReview, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
