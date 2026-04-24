require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001"
  }
});

// DB 연결
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

db.connect((err) => {
  if (err) {
    console.error('DB 연결 실패:', err);
  } else {
    console.log('DB 연결 성공');
  }
});

function makeReply(message) {
  if (message.includes("설치")) {
    return "설치 문의입니다.";
  } else if (message.includes("라이선스")) {
    return "라이선스 문의입니다.";
  } else {
    return "잘 모르겠어요.";
  }
}

// 기본 테스트
app.get('/', (req, res) => {
  res.send('Hello Server');
});

// 기존 HTTP API도 일단 유지
app.post('/chat', (req, res) => {
  const message = req.body.message;
  const reply = makeReply(message);

  const sql = "INSERT INTO messages (message, reply) VALUES (?, ?)";

  db.query(sql, [message, reply], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB 저장 실패" });
    }

    res.json({ reply });
  });
});

// 메시지 조회 API
app.get('/messages', (req, res) => {
  const sql = "SELECT * FROM messages ORDER BY id ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "조회 실패" });
    }

    res.json(results);
  });
});

// Socket.IO 연결
io.on('connection', (socket) => {
  console.log('사용자 소켓 연결됨');

  socket.on('chat message', (message) => {
    const reply = makeReply(message);

    const sql = "INSERT INTO messages (message, reply) VALUES (?, ?)";

    db.query(sql, [message, reply], (err) => {
      if (err) {
        console.error('DB 저장 실패:', err);
        socket.emit('chat response', "DB 저장 중 오류가 발생했습니다.");
        return;
      }

      socket.emit('chat response', reply);
    });
  });

  socket.on('disconnect', () => {
    console.log('사용자 소켓 연결 종료');
  });
});

server.listen(3000, () => {
  console.log('서버 실행됨: http://localhost:3000');
});