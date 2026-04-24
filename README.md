# Software Helpdesk Chatbot Backend

소프트웨어 설치, 라이선스, 반납 문의를 처리하는 실시간 챗봇 백엔드 서버입니다.

## 기술 스택

- Node.js
- Express
- Socket.IO
- MySQL
- dotenv
- cors

## 주요 기능

- Socket.IO 기반 실시간 채팅
- 사용자 메시지 키워드 분류
- 챗봇 응답 생성
- MySQL 메시지 이력 저장
- 저장된 채팅 이력 조회 API 제공
- 환경 변수 기반 DB 접속 정보 분리

## API

### GET /

서버 동작 확인용 API

### GET /messages

저장된 채팅 메시지 목록 조회

### POST /chat

HTTP 방식 채팅 요청 처리  
현재 Socket.IO 방식과 함께 유지 중

## Socket Event

### Client → Server

```text
chat message