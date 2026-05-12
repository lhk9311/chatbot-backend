// url 경로랑 컨트롤러 연결하는 파일.
// @RequestMapping이랑 같음.

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.chat);  // POST /chat
router.get('/messages', chatController.getMessages); // GET /chat/messages
router.get('/faqs', chatController.getFaqs); // GET /chat/faqs

module.exports = router;