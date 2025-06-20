import fetch from "node-fetch";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { system, messages } = req.body;
  if (typeof system !== "string" || !Array.isArray(messages)) {
    return res
      .status(400)
      .json({ error: "`system`(string)과 `messages`(array)를 모두 보내야 합니다." });
  }
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3.5",
        system,                   
        messages,                   
        max_tokens_to_sample: 1024, 
      }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      console.error("Anthropic API error:", apiRes.status, data);
      return res
        .status(apiRes.status)
        .json({ error: data.error || JSON.stringify(data) });
    }

    const reply = data.completion;
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Claude 요청 실패:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
