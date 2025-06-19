import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(bodyParser.json());

app.post("/pingping", async (req, res) => {
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
    console.log("📡 Claude 응답:", data);

    const reply = data.content?.[0]?.text || "❗ 응답 파싱 실패";
    res.json({ choices: [{ message: { content: reply } }] });
  } catch (err) {
    console.error("🔥 Claude API 요청 실패:", err);
    res.status(500).json({ error: "Claude API 요청 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 핑핑봇 서버 실행 중 👉 http://localhost:${PORT}`);
});
