export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다");
    return res.status(500).json({ error: "API 키가 설정되지 않았습니다" });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "유효하지 않은 메시지 형식입니다" });
  }

  try {
    console.log("🚀 Claude API 요청 시작...");
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        messages,
        max_tokens: 1024
      }),
    });

    console.log("📡 API 응답 상태:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Anthropic API 에러:", errorData);
      return res.status(response.status).json({ 
        error: "AI 서비스 오류",
        details: errorData 
      });
    }

    const data = await response.json();
    console.log("✅ API 응답 성공");
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error("❌ 예상치 못한 응답 형식:", data);
      return res.status(500).json({ error: "AI 응답 형식 오류" });
    }

    const reply = data.content[0].text;
    
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("💥 Claude API 요청 실패:", error);
    return res.status(500).json({ 
      error: "서버 내부 오류",
      message: error.message 
    });
  }
}