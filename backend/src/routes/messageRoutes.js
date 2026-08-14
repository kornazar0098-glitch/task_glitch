const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSendMessage } = require('../middleware/messageValidation');

// Protected routes
router.post('/', authMiddleware, validateSendMessage, messageController.sendMessage);
router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/booking/:booking_id', authMiddleware, messageController.getBookingMessages);
router.get('/unread/count', authMiddleware, messageController.getUnreadCount);
router.put('/:id/read', authMiddleware, messageController.markMessageAsRead);
router.put('/booking/:booking_id/read-all', authMiddleware, messageController.markAllAsRead);

module.exports = router;
