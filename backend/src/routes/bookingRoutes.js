const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateBooking } = require('../middleware/bookingValidation');

// Protected routes
router.post('/', authMiddleware, validateCreateBooking, bookingController.createBooking);
router.get('/worker/my-bookings', authMiddleware, bookingController.getWorkerBookings);
router.get('/task/:task_id', authMiddleware, bookingController.getTaskBookings);
router.get('/:id', authMiddleware, bookingController.getBookingById);
router.put('/:id/accept', authMiddleware, bookingController.acceptBooking);
router.put('/:id/reject', authMiddleware, bookingController.rejectBooking);
router.put('/:id/complete', authMiddleware, bookingController.completeBooking);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
