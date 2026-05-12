require('dotenv').config(); // .env 파일 로드

const express = require('express');  // Spring의 @SpringBootApplication 같은 거
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io'); // 실시간 통신
const db = require('./db'); // DB 연결
const OpenAI = require("openai"); // openapi

// OpenAI 함수 정의(리팩토링 필요 -> 서비스 폴더로 빼야됨)
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

// Express + Socket.io 설정 -> Spring Boot로 치면 application.yml 설정이랑 @Configuration 합쳐놓은 것.

module.exports = askLLM;


const app = express(); // Express 앱 생성
//app.use(cors()); // CORS 허용

// 변경
app.use(cors({
  origin: ["http://localhost:3000", "http://52.78.28.91", "http://52.78.28.91:4000"],
  credentials: true
}));

app.use(express.json()); // JSON 파싱

const server = http.createServer(app); // HTTP 서버 생성

// Socket.io 붙이기
// 기존
//const io = new Server(server, {
//  cors: { origin: ["http://localhost:3001", "http://localhost:3002", "http://52.78.28.91:4000"] }
//});

// 변경
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://52.78.28.91", "http://52.78.28.91:4000"],
    credentials: true
  }
});

// 라우터 + Socket + 서버 시작
const chatRoutes = require('./routes/chatRoutes'); // /chat으로 시작하는 URL은 chatRoutes가 처리
app.use('/chat', chatRoutes);

/*
  저장된 채팅 조회 API
  새로고침 시 이전 대화 복구용
*/
app.get('/messages', (req, res) => { // 채팅 내역 조회 API

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
require('./socket/chatSocket')(io); // 소켓 이벤트 등록

// 로컬에선는 3000 포트
server.listen(4000, () => { // 4000번 포트로 서버 시작
  console.log('서버 실행됨');
});
