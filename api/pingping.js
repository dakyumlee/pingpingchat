export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }
  
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
    const claudeMessages = req.body.messages.map(msg => ({
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
      const reply = data.content?.[0]?.text || "응답 이상함";
  
      return res.status(200).json({
        choices: [{ message: { content: reply } }]
      });
    } catch (err) {
      console.error("❌ Claude API 실패", err);
      return res.status(500).json({ error: "Claude API 실패" });
    }
  }
  