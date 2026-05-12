const OpenAI = require("openai");

// 1. OpenAI 클라이언트 생성 (.env의 API 키 사용)
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 2. GPT한테 질문하는 함수
async function askLLM(question) {

    try {

        console.log("GPT 질문:", question);

        const response = await client.chat.completions.create({
            model: "gpt-4.1-mini",

            messages: [
                {
                    role: "system",
                    content: `
                    너는 사내 소프트웨어 헬프데스크 챗봇이다. 
                    업무적으로 간단히 답변해라.
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