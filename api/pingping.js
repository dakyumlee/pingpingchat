// api/pingping.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { messages } = req.body;
    const API_KEY = process.env.ANTHROPIC_API_KEY;
  
    try {
      const response = await fetch("https://api.anthropic.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          messages,                         
          max_tokens_to_sample: 1024,      
        }),
      });
  
      if (!response.ok) {
        const err = await response.json();
        console.error("Anthropic API error:", err);
        return res.status(response.status).json({ error: err });
      }
  
      const { completion } = await response.json();
      const reply = completion.trim();
      return res.status(200).json({ reply });
  
    } catch (error) {
      console.error("Claude API 요청 실패", error);
      return res.status(500).json({ error: "Claude API 요청 실패" });
    }
  }
  