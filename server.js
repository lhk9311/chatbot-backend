require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

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

// 👉 socket 연결
require('./socket/chatSocket')(io);

server.listen(3000, () => {
  console.log('서버 실행됨');
});
