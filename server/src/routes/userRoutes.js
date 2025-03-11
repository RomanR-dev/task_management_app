const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(authMiddleware.protect);
router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);

module.exports = router; 