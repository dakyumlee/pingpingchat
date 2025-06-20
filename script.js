  document.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById("themeSelect");
  const pingpingMood = document.getElementById("pingpingMood");
  const container = document.querySelector(".container");
  const form = document.getElementById("chatForm");       // 이제 null 아님
  const userInput = document.getElementById("userInput");
  const botBox = document.getElementById("botResponse");
  const clearBtn = document.getElementById("clearBtn");

  const colorMap = {
    joy: "#fffbea",
    sadness: "#e3f2fd",
    anger: "#ffebee",
    disgust: "#f3e5f5",
    fear: "#ede7f6"
  };
  const emoMap = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    disgust: "🤢",
    fear: "😨"
  };

  const personaPrompt = {
    role: "user",
    content: `
당신은 '핑핑'이라는 챗봇입니다. 당신은 사용자의 친구로 친밀함이 기본이라는 점을 명심하세요!
핑핑 안에는 인사이드아웃의 다섯 감정(Joy, Sadness, Anger, Disgust, Fear)이 공존하며,
현재 사용자가 선택한 감정에 따라 그 페르소나의 톤과 어휘로만 대답해야 합니다.
예를 들어 사용자가 'joy'를 선택했다면 항상 기쁘고 긍정적인 어투만 사용하세요.
`.trim()
  };

  updateMood(themeSelect.value);

  themeSelect.addEventListener("change", () => {
    updateMood(themeSelect.value);
  });

  clearBtn.addEventListener("click", () => {
    botBox.innerHTML = "";
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    userInput.value = "";

    appendMessage("bot", `${emoMap[themeSelect.value]} 응답 대기중...`);

    const toSend = [
      personaPrompt,
      { role: "user", content: text }
    ];

    try {
      const reply = await sendToClaude(toSend);
      removeLastBotBubble();
      appendMessage("bot", reply);
    } catch (err) {
      removeLastBotBubble();
      appendMessage("bot", "❌ 서버가 응답하지 않음");
      console.error(err);
    }
  });

  function updateMood(key) {
    container.style.backgroundColor = colorMap[key];
    pingpingMood.textContent =
      `오늘 핑핑이의 감정 상태: ${emoMap[key]} ${key.toUpperCase()}`;
  }

  function appendMessage(sender, msg) {
    const div = document.createElement("div");
    div.className = sender === "user" ? "user-message" : "bot-message";
    div.textContent = msg;
    botBox.append(div);
    botBox.scrollTop = botBox.scrollHeight;
  }

  function removeLastBotBubble() {
    const bots = botBox.querySelectorAll(".bot-message");
    if (bots.length) bots[bots.length - 1].remove();
  }

  async function sendToClaude(messages) {
    const res = await fetch("/api/pingping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error("API error");
    const { reply } = await res.json();
    return reply;
  }
});
