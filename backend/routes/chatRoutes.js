const express = require('express');
const router = express.Router();
const { saveChat, getChatHistory, getChat } = require('../controllers/chatController');
const { protectRoutes } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.post('/save', protectRoutes, saveChat);
router.get('/history', protectRoutes, getChatHistory);
router.get('/:chatId', protectRoutes, getChat);

module.exports = router; 