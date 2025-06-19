import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(bodyParser.json());

app.post("/pingping", async (req, res) => {
  const messages = req.body.messages;

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
    console.log("📡 Claude 응답:", JSON.stringify(data, null, 2));

    const reply = data?.content?.[0]?.text?.trim() || "응답 없음.";

    res.json({
      reply: reply
    });
  } catch (err) {
    console.error("🔥 Claude API 실패:", err);
    res.status(500).json({ error: "Claude API 요청 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`로컬 서버 실행중 👉 http://localhost:${PORT}`);
});
