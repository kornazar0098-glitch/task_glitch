const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCreateTask, validateUpdateTask } = require('../middleware/taskValidation');

// Public routes
router.get('/', taskController.getTasks);
router.get('/nearby', taskController.getNearbyTasks);
router.get('/:id', taskController.getTaskById);

// Protected routes
router.post('/', authMiddleware, validateCreateTask, taskController.createTask);
router.get('/user/my-tasks', authMiddleware, taskController.getUserTasks);
router.put('/:id', authMiddleware, validateUpdateTask, taskController.updateTask);
router.put('/:id/cancel', authMiddleware, taskController.cancelTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;
