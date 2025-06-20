document.addEventListener("DOMContentLoaded", () => {
  const themeSelect  = document.getElementById("themeSelect");
  const pingpingMood = document.getElementById("pingpingMood");
  const chatBox      = document.getElementById("botResponse");
  const userInput    = document.getElementById("userInput");
  const submitBtn    = document.getElementById("submitBtn");
  const clearBtn     = document.getElementById("clearBtn");

  const personaMap = {
    random:  "너는 핑핑이야. 사용자의 제일 친한 친구야. 어떤 감정이든 편안하게 이야기하도록 도와줘.",
    joy:     "너는 지금 기쁨(Joy) 인격이야. 언제나 유쾌하고 흥겨운 톤으로 답해 줘.",
    sadness: "너는 지금 슬픔(Sadness) 인격이야. 부드럽고 위로하는 톤으로 답해 줘.",
    anger:   "너는 지금 분노(Anger) 인격이야. 직설적이고 터프한 톤으로 답해 줘.",
    disgust: "너는 지금 혐오(Disgust) 인격이야. 살짝 비꼬고 재치 있게 답해 줘.",
    fear:    "너는 지금 공포(Fear) 인격이야. 조심스럽고 신중한 톤으로 답해 줘."
  };

  const colorMap = {
    random:  "#f0f0f0",
    joy:     "#fff7e6",
    sadness: "#e6f0ff",
    anger:   "#ffe6e6",
    disgust: "#e6ffe6",
    fear:    "#f7e6ff"
  };
  const moodMap = {
    random:  "?",
    joy:     "😊 JOY",
    sadness: "😢 SADNESS",
    anger:   "😡 ANGER",
    disgust: "🤢 DISGUST",
    fear:    "😨 FEAR"
  };

  const conversation = [{
    role: "system",
    content: personaMap.random
  }];

  function updateTheme(key) {
    pingpingMood.textContent = `오늘 핑핑이의 감정 상태: ${moodMap[key]}`;
    document.querySelector(".container").style.backgroundColor = colorMap[key];

    conversation[0].content = personaMap[key];
  }
  updateTheme(themeSelect.value);
  themeSelect.addEventListener("change", () => updateTheme(themeSelect.value));

  function makeBubble(sender, text) {
    const wrap = document.createElement("div");
    wrap.className = `message ${sender}-message`;
    const p = document.createElement("p");
    p.className = "message-text";
    p.textContent = sender === "user" 
      ? `너: ${text}` 
      : `핑핑봇: ${text}`;
    wrap.appendChild(p);
    return wrap;
  }

  async function sendToClaude(conv) {
    const res = await fetch("/api/pingping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        model:      "claude-3-5-sonnet-20240620", 
        max_tokens: 1024,
        messages:   conv
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { reply } = await res.json();
    return reply;
  }

  async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;
    chatBox.appendChild(makeBubble("user", text));
    conversation.push({ role: "user", content: text });
    userInput.value = "";

    const placeholder = makeBubble("bot", "⏳ 응답 대기중...");
    chatBox.appendChild(placeholder);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const reply = await sendToClaude(conversation);
      conversation.push({ role: "assistant", content: reply });
      placeholder.querySelector(".message-text")
                 .textContent = `핑핑봇: ${reply}`;
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) {
      console.error(e);
      placeholder.querySelector(".message-text")
                 .textContent = "❌ 서버 응답 없음";
    }
  }

  submitBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });

  clearBtn.addEventListener("click", () => {
    chatBox.innerHTML = "";
    conversation.splice(1);
    themeSelect.value = "random";
    updateTheme("random");
  });
});

await fetch("/api/pingping", {
  method: "POST",
  headers: { "Content-Type":"application/json" },
  body: JSON.stringify({ messages: conversation })
});
