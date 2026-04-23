const express = require('express');
const mysql = require('mysql2');
const app = express();

// 사용자가 브라우저에서 요청함.(JSON 받기 위해 필요)
app.use(express.json());

const cors = require('cors');
app.use(cors());

// DB 연결
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'lhk290662!', // MySQL 비밀번호 입력
    database: 'chatbot'
  });
  
  db.connect((err) => {
    if (err) {
      console.error('DB 연결 실패:', err);
    } else {
      console.log('DB 연결 성공');
    }
  });

// 기본 테스트
app.get('/', (req, res) => {
  res.send('Hello Server');
});

// 새로운 API (핵심) ---> 서버에 브라우저 f12에서 작성한 fetch 안의 message "안녕하세요" 전달되면 명령프롬프트에 하기 문구 뜸.
/*
    app.post('/chat', (req, res) => {
    console.log(req.body); // 내가 보낸 데이터 확인

    res.json({
        reply: "서버가 메시지 잘 받았음 👍"
    });
    });
*/

// 🔥 챗봇 + DB 저장
app.post('/chat', (req, res) => {
    const message = req.body.message;
  
    let reply = "";
  
    if (message.includes("설치")) {
      reply = "설치 문의입니다.";
    } else if (message.includes("라이선스")) {
      reply = "라이선스 문의입니다.";
    } else {
      reply = "잘 모르겠어요.";
    }
  
    // 🔥 DB 저장
    const sql = "INSERT INTO messages (message, reply) VALUES (?, ?)";
  
    db.query(sql, [message, reply], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB 저장 실패" });
      }
  
      res.json({ reply });
    });
  });

  // 🔥 메시지 조회 API
app.get('/messages', (req, res) => {
    const sql = "SELECT * FROM messages ORDER BY id DESC";
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "조회 실패" });
      }
  
      res.json(results);
    });
  });


app.listen(3000, () => {
  console.log('서버 실행됨: http://localhost:3000');
});