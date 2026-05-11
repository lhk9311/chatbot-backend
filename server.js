require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db'); // api
const OpenAI = require("openai"); // openapi

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askLLM(question) {

  try {

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content: `
                    너는 사내 소프트웨어 라이선스 헬프데스크 챗봇이다.
                    소프트웨어 설치, 라이선스, 반납, 계정 관련 질문에 답변한다.
                    답변은 짧고 업무적으로 해라.
                    `
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    return response.choices[0].message.content;

  } catch (err) {

    console.error("OpenAI 오류:", err);

    return "AI 응답 생성 중 오류가 발생했습니다.";
  }

}

module.exports = askLLM;


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:3001", "http://localhost:3002"] }
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
