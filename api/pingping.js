import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { system, messages } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        system,               
        messages,             
        max_tokens: 1024,    
      }),
    });

    if (!apiRes.ok) {
      const errTxt = await apiRes.text();
      console.error("Anthropic API 에러:", apiRes.status, errTxt);
      return res.status(apiRes.status).json({ error: errTxt });
    }

    const data = await apiRes.json();
    const reply = data.completion;
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Claude API 요청 실패:", err);
    return res.status(500).json({ error: "Claude API 요청 실패" });
  }
}
