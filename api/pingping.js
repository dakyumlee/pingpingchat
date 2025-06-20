const API_KEY = process.env.ANTHROPIC_API_KEY;
console.log("API_KEY exists:", !!API_KEY);
console.log("API_KEY length:", API_KEY?.length);

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { messages } = req.body;
    const API_KEY = process.env.ANTHROPIC_API_KEY;
  
    if (!API_KEY) {
      return res.status(500).json({ error: "API 키가 설정되지 않았습니다" });
    }
  
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          messages,
          max_tokens: 1024
        }),
      });
  
      if (!response.ok) {
        const err = await response.json();
        console.error("Anthropic API error:", err);
        return res.status(response.status).json({ error: err });
      }
  
      const data = await response.json();
      const reply = data.content[0].text;
      
      return res.status(200).json({ reply });
  
    } catch (error) {
      console.error("Claude API 요청 실패", error);
      return res.status(500).json({ error: "Claude API 요청 실패" });
    }
  }
  