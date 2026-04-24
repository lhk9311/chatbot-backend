const db = require('../db');

function makeReply(message) {
  if (message.includes("설치")) return "설치 문의입니다.";
  if (message.includes("라이선스")) return "라이선스 문의입니다.";
  return "잘 모르겠어요.";
}

exports.chat = (req, res) => {
  const message = req.body.message;
  const reply = makeReply(message);

  db.query(
    "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
    [message, reply],
    (err) => {
      if (err) return res.status(500).json({ error: "DB 저장 실패" });
      res.json({ reply });
    }
  );
};

exports.getMessages = (req, res) => {
  const sql = "SELECT * FROM chatbot_messages ORDER BY id ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("메시지 조회 실패:", err);
      return res.status(500).json({ error: "조회 실패" });
    }

    res.json(results);
  });
};