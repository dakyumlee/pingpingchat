import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/pingping", async (req, res) => {
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
    const reply = data.content?.[0]?.text || "응답 없음";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("🔥 Claude API 실패:", err);
    res.status(500).json({ error: "서버 내부 오류" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행됨 http://localhost:${PORT}`);
});
