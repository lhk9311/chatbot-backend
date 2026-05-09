const db = require('../db');
const askLLM = require('../services/openaiService');

module.exports = (io) => {

    io.on('connection', (socket) => {

        console.log('사용자 소켓 연결됨');

        socket.on('chat message', (message) => {

            /*
              소프트웨어 alias 검색
            */
            const sql = `
                SELECT s.*, sa.alias_name
                FROM software_alias sa
                         JOIN software s
                              ON sa.software_id = s.id
                WHERE LOWER(?) LIKE CONCAT('%', LOWER(sa.alias_name), '%')
                ORDER BY CHAR_LENGTH(sa.alias_name) DESC
                    LIMIT 1
            `;

            db.query(sql, [message], (err, results) => {

                /*
                  DB 오류
                */
                if (err) {

                    console.error(err);

                    const reply = "서버 오류 발생";

                    db.query(
                        "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
                        [message, reply]
                    );

                    socket.emit("chat response", reply);

                    return;
                }

                /*
                  소프트웨어 못 찾음
                */
                if (results.length === 0) {

                    const faqOnlySql = `
                        SELECT answer
                        FROM faq
                        WHERE LOWER(?) LIKE CONCAT('%', LOWER(question_keyword), '%')
                        ORDER BY CHAR_LENGTH(question_keyword) DESC
                            LIMIT 1
                    `;

                    db.query(
                        faqOnlySql,
                        [message],
                        async (faqErr, faqResults) => {

                            /*
                              FAQ 조회 오류
                            */
                            if (faqErr) {

                                console.error(faqErr);

                                socket.emit(
                                    "chat response",
                                    "FAQ 조회 오류"
                                );

                                return;
                            }

                            let reply = "";

                            /*
                              FAQ 찾음
                            */
                            if (faqResults.length > 0) {

                                reply = faqResults[0].answer;

                            } else {

                                /*
                                  FAQ 없음 → GPT
                                */

                                const llmReply = await askLLM(message);

                                reply =
                                    `관련 FAQ를 찾을 수 없어 AI 답변을 제공합니다.\n\n🧠 AI 답변 : \n\n${llmReply}`;

                                /*
                                  관리자 문의 등록
                                */
                                io.emit("admin-request", {
                                    software: "미분류",
                                    message: message,
                                    createdAt: new Date()
                                });

                            }

                            /*
                              DB 저장
                            */
                            db.query(
                                "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
                                [message, reply]
                            );

                            /*
                              사용자 응답
                            */
                            socket.emit(
                                "chat response",
                                reply
                            );

                        }
                    );

                    return;
                }

                /*
                  소프트웨어 찾음
                */
                const sw = results[0];

                /*
                  FAQ 조회
                */
                const faqSql = `
                    SELECT answer
                    FROM faq
                    WHERE LOWER(?) LIKE CONCAT('%', LOWER(question_keyword), '%')
                    ORDER BY CHAR_LENGTH(question_keyword) DESC
                        LIMIT 1
                `;

                db.query(
                    faqSql,
                    [message],
                    async (faqErr, faqResults) => {

                        /*
                          FAQ 조회 오류
                        */
                        if (faqErr) {

                            console.error("FAQ 조회 실패:", faqErr);

                            socket.emit(
                                "chat response",
                                "FAQ 조회 실패"
                            );

                            return;
                        }

                        let reply = "";

                        /*
                          FAQ 찾음
                        */
                        if (faqResults.length > 0) {

                            reply = faqResults[0].answer;

                        } else {

                            /*
                              FAQ 없음 → GPT
                            */

                            const llmReply = await askLLM(message);

                            reply =
                                `${sw.name} 관련 FAQ를 찾을 수 없어 AI 답변을 제공합니다.\n\n🧠 AI 답변 :\n\n${llmReply}`;

                            /*
                              관리자 문의 등록
                            */
                            io.emit("admin-request", {
                                software: sw.name,
                                message: message,
                                createdAt: new Date()
                            });

                        }

                        /*
                          채팅 저장
                        */
                        db.query(
                            "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
                            [message, reply],
                            (saveErr) => {

                                if (saveErr) {
                                    console.error("메시지 저장 실패:", saveErr);
                                }
                            }
                        );

                        /*
                          사용자 응답
                        */
                        socket.emit(
                            "chat response",
                            reply
                        );

                    }
                );

            });

        });

        socket.on('disconnect', () => {
            console.log('연결 종료');
        });

    });

};