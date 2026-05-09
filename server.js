require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db'); // api


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3001" }
});

// 👉 라우터 연결
const chatRoutes = require('./routes/chatRoutes');
app.use('/chat', chatRoutes);

/*
  저장된 채팅 조회 API
  새로고침 시 이전 대화 복구용
*/
app.get('/messages', (req, res) => {

  const sql = `
    SELECT *
    FROM chatbot_messages
    ORDER BY created_at ASC
  `;

  db.query(sql, (err, results) => {

    // DB 조회 실패
    if (err) {

      console.error(err);

      return res.status(500).json({
        error: '채팅 조회 실패'
      });
    }

    // 채팅 목록 반환
    res.json(results);

  });

});

// 👉 socket 연결
require('./socket/chatSocket')(io);

server.listen(3000, () => {
  console.log('서버 실행됨');
});
