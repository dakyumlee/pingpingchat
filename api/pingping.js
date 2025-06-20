import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { system, messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "`messages` must be an array" });
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const apiRes = await fetch(
      "https://api.anthropic.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3.5-sonnet-20240620",
          system,                    
          messages,                  
          max_tokens_to_sample: 1024, 
        }),
      }
    );

    const data = await apiRes.json();
    if (!apiRes.ok) {
      console.error("Anthropic API error:", apiRes.status, data);
      return res
        .status(apiRes.status)
        .json({ error: data.error || JSON.stringify(data) });
    }

    const reply = data.completion;
    if (typeof reply !== "string") {
      console.error("No completion in response:", data);
      return res
        .status(500)
        .json({ error: "No completion in response (check logs)" });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Claude request failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
