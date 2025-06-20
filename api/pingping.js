import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body;
    const model      = "claude-3-5-sonnet-20240620";
    const max_tokens = 1024;

    const API_KEY = process.env.ANTHROPIC_API_KEY;

    const anthRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type":      "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages
      }),
    });

    const data = await anthRes.json();
    const reply = data.completion?.trim() || "△ 응답 없음. 콘솔 확인 ㄱ";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Anthropic API 실패", err);
    return res.status(500).json({ error: "Anthropic 요청 실패" });
  }
}
