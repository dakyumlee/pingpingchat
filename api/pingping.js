import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  const messages = req.body.messages;

  const claudeMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: claudeMessages
      })
    });

    const data = await response.json();
    console.log("📡 Claude 응답:", JSON.stringify(data, null, 2));

    const reply = data.content?.[0]?.text || "응답 이상함. 콘솔 확인 ㄱ";
    res.status(200).json({ choices: [{ message: { content: reply } }] });
  } catch (err) {
    console.error("🔥 Claude API 요청 실패:", err);
    res.status(500).json({ error: "Claude API 요청 실패" });
  }
}
