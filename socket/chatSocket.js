const db = require('../db');

module.exports = (io) => {
  // Socket.IO 연결
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
      
          if (results.length === 0) {
            const reply = "해당 소프트웨어를 찾을 수 없습니다.";
      
            db.query(
              "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
              [message, reply]
            );
      
            socket.emit('chat response', reply);
            return;
          }
      
          const sw = results[0];
          const available = sw.total_count - sw.used_count;
      
          let reply = "";
      
          if (
            message.includes("재고") ||
            message.includes("남아") ||
            message.includes("사용 가능") ||
            message.includes("있어요") ||
            message.includes("있나요")
          ) {
            reply = `${sw.name} 사용 가능 수량은 ${available}개입니다.`;
          } 
          
          else if (
            message.includes("설치") ||
            message.includes("깔아") ||
            message.includes("다운로드")
          ) {
            reply = `${sw.name}는 ${sw.license_method} 방식으로 제공됩니다. 예상 설치 소요 시간은 ${sw.install_time}입니다.`;
          } 
          
          else if (
            message.includes("라이선스") ||
            message.includes("계정") ||
            message.includes("인증키")
          ) {
            reply = `${sw.name}의 라이선스 구분은 ${sw.license_type}이며, 지급 방식은 ${sw.license_method}입니다.`;
          } 
          
          else if (
            message.includes("반납") ||
            message.includes("회수") ||
            message.includes("사용 안")
          ) {
            reply = sw.return_required
              ? `${sw.name}는 사용 종료 시 반납 또는 회수 처리가 필요합니다.`
              : `${sw.name}는 별도 반납 처리가 필요하지 않습니다.`;
          } 
          
          else if (
            message.includes("승인") ||
            message.includes("신청")
          ) {
            reply = sw.approval_required
              ? `${sw.name}는 사용 전 승인 절차가 필요합니다.`
              : `${sw.name}는 별도 승인 없이 사용 가능합니다.`;
          } 
          
          else if (
            message.includes("NetHelper") ||
            message.includes("넷헬퍼") ||
            message.includes("허용") ||
            message.includes("차단")
          ) {
            reply = `${sw.name}의 NetHelper 상태는 '${sw.nethelper_status}'입니다.`;
          } 
          
          else {
            reply = `${sw.name}에 대한 문의로 확인되었습니다. 재고, 설치, 라이선스, 반납, 승인 여부 중 궁금한 내용을 함께 입력해주세요.`;
          }
      
          db.query(
            "INSERT INTO chatbot_messages (message, reply) VALUES (?, ?)",
            [message, reply],
            (saveErr) => {
              if (saveErr) {
                console.error("메시지 저장 실패:", saveErr);
              }
            }
          );
      
          socket.emit('chat response', reply);
        });
      });

    socket.on('disconnect', () => {
      console.log('연결 종료');
    });
  });
};