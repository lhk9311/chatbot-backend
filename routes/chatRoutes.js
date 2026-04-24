const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.chat);
router.get('/messages', chatController.getMessages);

module.exports = router;