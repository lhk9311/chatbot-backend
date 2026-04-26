const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.chat);
router.get('/messages', chatController.getMessages);
router.get('/faqs', chatController.getFaqs);

module.exports = router;