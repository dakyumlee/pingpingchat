document.addEventListener("DOMContentLoaded", () => {

  const themeSelect = document.getElementById("themeSelect");
  const pingpingMood = document.getElementById("pingpingMood");
  const chatBox = document.getElementById("botResponse");
  const userInput = document.getElementById("userInput");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");

  const conversation = [
    {
      role: "system",
      content:
        "당신은 친절하고 유머러스한 핑핑봇입니다. 사용자의 감정 상태에 맞춰 답해 주세요."
    }
  ];


  const colorMap = {
    random: "#ffffff",
    joy: "#FFF3B6",
    sadness: "#CCE0FF",
    anger: "#FFDACC",
    disgust: "#E2FFE2",
    fear: "#FFE2F7"
  };
  const moodMap = {
    random: "로딩 중...",
    joy: "Joy",
    sadness: "Sadness",
    anger: "Anger",
    disgust: "Disgust",
    fear: "Fear"
  };
  function updateTheme(key) {
    pingpingMood.textContent = `오늘 핑핑이의 감정 상태: ${moodMap[key]}`;
    document.querySelector(".container").style.backgroundColor =
      colorMap[key];
  }
  updateTheme(themeSelect.value);
  themeSelect.addEventListener("change", () => {
    updateTheme(themeSelect.value);
  });

  function appendMessage(sender, text) {
    const wrap = document.createElement("div");
    wrap.classList.add(sender === "user" ? "user-message" : "bot-message");
    wrap.classList.add("message");

    const p = document.createElement("p");
    p.classList.add("message-text");
    p.textContent = sender === "user" ? `너: ${text}` : `핑핑봇: ${text}`;

    wrap.appendChild(p);
    chatBox.appendChild(wrap);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  function updateLastBot(text) {
    const bots = chatBox.querySelectorAll(".bot-message .message-text");
    if (!bots.length) return;
    bots[bots.length - 1].textContent = `핑핑봇: ${text}`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendToClaude(conv) {
    const res = await fetch("/api/pingping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: conv[0].content,   
        messages: conv.slice(1)   
      })
    });
    if (!res.ok) throw new Error(`API 오류 ${res.status}`);
    const { reply } = await res.json();
    return reply;
  }


  async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    userInput.value = "";

    conversation.push({ role: "user", content: text });
    appendMessage("bot", "⏳ 응답 대기중...");

    try {
      const reply = await sendToClaude(conversation);
      conversation.push({ role: "assistant", content: reply });
      updateLastBot(reply ?? "⚠ 응답 없음");
    } catch (e) {
      console.error(e);
      updateLastBot("❌ 서버가 응답하지 않음");
    }
  }
  submitBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });


  clearBtn.addEventListener("click", () => {
    chatBox.innerHTML = "";
    conversation.splice(1);
    userInput.value = "";
    themeSelect.value = "random";
    updateTheme("random");
  });
});
