import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "응답 없음";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("🔥 Claude API 실패:", err);
    res.status(500).json({ error: "Claude API 요청 실패" });
  }
}
