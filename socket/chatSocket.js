const db = require('../db');

module.exports = (io) => {

  io.on('connection', (socket) => {

    console.log('사용자 소켓 연결됨');

    socket.on('chat message', (message) => {

      const sql = `
        SELECT s.*, sa.alias_name
        FROM software_alias sa
        JOIN software s ON sa.software_id = s.id
        WHERE LOWER(?) LIKE CONCAT('%', LOWER(sa.alias_name), '%')
        ORDER BY CHAR_LENGTH(sa.alias_name) DESC
        LIMIT 1
      `;

      db.query(sql, [message], (err, results) => {

        // DB 오류
        if (err) {

          console.error(err);

          const reply = "서버 오류 발생";

          db.query(
              "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
              [message, reply]
          );

          socket.emit('chat response', reply);

          return;
        }

        // 소프트웨어 못 찾음
          if (results.length === 0) {

              const faqOnlySql = `
    SELECT answer
    FROM faq
    WHERE ? LIKE CONCAT('%', question_keyword, '%')
    LIMIT 1
  `;

              db.query(
                  faqOnlySql,
                  [message],
                  (faqErr, faqResults) => {

                      if (faqErr) {
                          console.error(faqErr);
                          socket.emit("chat response", "FAQ 조회 오류");
                          return;
                      }

                      if (faqResults.length > 0) {

                          const reply = faqResults[0].answer;

                          // DB 저장
                          db.query(
                              "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
                              [message, reply]
                          );

                          // 사용자 응답
                          socket.emit(
                              "chat response",
                              reply
                          );

                      } else {

                          socket.emit(
                              "chat response",
                              "관련 FAQ를 찾을 수 없습니다."
                          );
                      }
                  }
              );

              return;
          }

        const sw = results[0];

        let reply = "";

        // FAQ 조회
        const faqSql = `
            SELECT answer
            FROM faq
            WHERE question_keyword = ?
                LIMIT 1
        `;

        db.query(
            faqSql,
            [message],
            (faqErr, faqResults) => {

              if (faqErr) {

                console.error("FAQ 조회 실패:", faqErr);

                return;
              }

              // FAQ 찾음
              if (faqResults.length > 0) {

                reply = faqResults[0].answer;

              } else {

                // FAQ 없음
                reply =
                    `${sw.name} 관련 FAQ를 찾을 수 없습니다. 관리자 문의로 전환합니다.`;

                console.log("관리자 이벤트 발생:", {
                  software: sw.name,
                  message: message
                });

                io.emit("admin-request", {
                  software: sw.name,
                  message: message,
                  createdAt: new Date()
                });
              }

              // 채팅 저장
              db.query(
                  "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
                  [message, reply],
                  (saveErr) => {

                    if (saveErr) {
                      console.error("메시지 저장 실패:", saveErr);
                    }
                  }
              );

              // 사용자 응답
              socket.emit("chat response", reply);
            }
        );
      });
    });

    socket.on('disconnect', () => {
      console.log('연결 종료');
    });

  });
};