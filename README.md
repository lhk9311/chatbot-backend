# 🤖 Software Helpdesk Chatbot Backend

소프트웨어 설치, 라이선스, 반납 및 기술 문의를 처리하기 위한  
실시간 AI 기반 헬프데스크 챗봇 백엔드 서버입니다.

FAQ 기반 응답 시스템과 OpenAI API 기반 AI Fallback 구조를 결합하여  
미처리 문의를 최소화하고 관리자 대응 프로세스를 자동화하는 데 집중했습니다.

---

# 🛠 기술 스택

## Backend
- Node.js
- Express
- Socket.IO
- OpenAI API
- MySQL

## Library
- dotenv
- cors
- axios

---

# 🚀 주요 기능

- Socket.IO 기반 실시간 채팅
- FAQ 기반 우선 응답 시스템
- OpenAI API 기반 AI Fallback 응답
- 소프트웨어 Alias 기반 자연어 검색
- 관리자 미처리 문의 패널 연동
- 채팅 로그 저장 및 조회
- AI 응답 생성중 로딩 처리
- 환경 변수 기반 API KEY 및 DB 정보 분리

---

# ✅ 핵심 구현 내용

## 1. FAQ + AI Hybrid 응답 구조

사용자 질문 처리 흐름:

```text
사용자 질문
→ 소프트웨어 Alias 검색
→ FAQ 조회
→ FAQ 존재 시 FAQ 응답
→ FAQ 미존재 시 OpenAI API 호출
→ AI 응답 반환
→ 관리자 미처리 문의 등록
```

FAQ 기반 응답을 우선 처리하고,  
미처리 문의는 GPT 기반 AI 응답으로 자동 연결되도록 구현했습니다.

---

## 2. Socket.IO 실시간 문의 처리

Socket.IO 기반 양방향 통신 구조를 적용하여:

- 사용자 질문 실시간 처리
- 챗봇 응답 실시간 반환
- 관리자 문의 패널 실시간 동기화

구조를 구현했습니다.

---

## 3. 자연어 기반 FAQ 검색 개선

기존 완전일치(`=`) 검색 방식 대신:

```sql
LIKE CONCAT('%keyword%')
```

기반 부분 검색 구조를 적용하여 자연어 질문 대응 정확도를 개선했습니다.

추가로:

```sql
ORDER BY CHAR_LENGTH(question_keyword) DESC
```

적용을 통해 긴 키워드 우선 검색이 가능하도록 개선했습니다.

---

## 4. OpenAI API 연동

OpenAI Node.js SDK를 활용하여  
FAQ 미존재 문의에 대한 AI 응답 생성 기능을 구현했습니다.

```bash
npm install openai
```

`.env` 기반 API KEY 관리 구조를 적용했습니다.

---

# 📡 API

## GET /

서버 상태 확인 API

---

## GET /messages

저장된 채팅 이력 조회 API

---

## GET /chat/faqs

FAQ 목록 조회 API

---

## POST /chat

HTTP 기반 채팅 요청 API  
(Socket.IO 구조와 병행 유지)

---

# 🔌 Socket Event

## Client → Server

```text
chat message
```

사용자 메시지 전송 이벤트

---

## Server → Client

```text
chat response
```

챗봇 응답 반환 이벤트

```text
admin-request
```

미처리 문의 관리자 패널 전달 이벤트

---

# 📂 프로젝트 구조

```text
chatbot-backend
 ├── routes         # FAQ 및 채팅 API
 ├── socket         # Socket.IO 이벤트 처리
 ├── services       # OpenAI API 서비스 로직
 ├── db             # MySQL 연결 처리
 ├── .env           # 환경 변수 관리
 └── server.js      # 서버 실행 및 Socket 초기화
```

---

# ⚠️ 트러블슈팅

## FAQ 완전일치 검색 실패 문제

### 문제 상황
기존 `=` 기반 검색 구조에서 자연어 질문 검색 실패 발생.

예:
```text
"설치 방법 알려줘"
```

→ `"설치"` 키워드 검색 실패

### 해결 방안

```sql
WHERE LOWER(?) LIKE CONCAT('%', LOWER(question_keyword), '%')
```

기반 부분 검색 구조 적용.

### 결과
FAQ 검색 성공률 향상 및 자연어 대응 개선.

---

## React 줄바꿈 렌더링 문제

### 문제 상황
AI 응답 내 `\n` 줄바꿈 미적용.

### 해결 방안

```jsx
style={{ whiteSpace: 'pre-line' }}
```

적용.

### 결과
AI 응답 가독성 및 UX 개선.

---

# ▶ 실행 방법

## 1. 패키지 설치

```bash
npm install
```

---

## 2. .env 설정

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=비밀번호
DB_NAME=chatbot

OPENAI_API_KEY=발급키
```

---

## 3. 서버 실행

```bash
npm start
```

---

# 🎯 프로젝트 목표

- FAQ 기반 헬프데스크 자동화
- 미처리 문의 최소화
- 실시간 문의 대응 시스템 구현
- AI 기반 자연어 응답 구조 설계
- 관리자 대응 프로세스 개선