require('dotenv').config();

const mysql = require('mysql2');

// Spring Boot의 DataSource 설정이랑 똑같음. MySQL 연결 설정
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

module.exports = db;

console.log("현재 연결 DB:", process.env.DB_NAME);