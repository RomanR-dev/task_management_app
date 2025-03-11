const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Special routes - must be defined before the :id route
router.get('/overdue/tasks', taskController.getOverdueTasks);

// Task routes
router.route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router.route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router; 
