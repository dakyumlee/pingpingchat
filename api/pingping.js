import fetch from "node-fetch";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const messages = req.body.messages;
  const claudeMessages = messages.map(m => ({ role: m.role, content: m.content }));
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "API KEY missing" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: claudeMessages
      })
    });
    const data = await r.json();
    const reply = data.content?.[0]?.text || "응답 이상";
    return res.json({ choices: [{ message: { content: reply }}] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "API 요청 실패" });
  }
}
