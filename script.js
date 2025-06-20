document.addEventListener("DOMContentLoaded", () => {
  
  const themeSelect = document.getElementById("themeSelect");
  const pingpingMood = document.getElementById("pingpingMood");
  const chatBox = document.getElementById("botResponse");
  const userInput = document.getElementById("userInput");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");

  const conversation = [];

  const colorMap = {
    random: "#ffffff",
    joy: "#FFF3B6",
    sadness: "#CCE0FF",
    anger: "#FFDACC",
    disgust: "#E2FFE2",
    fear: "#FFE2F7",
  };
  const moodMap = {
    random: "로딩 중...",
    joy: "Joy",
    sadness: "Sadness",
    anger: "Anger",
    disgust: "Disgust",
    fear: "Fear",
  };
  function updateTheme(key) {
    pingpingMood.textContent = `오늘 핑핑이의 감정 상태: ${moodMap[key] || key}`;
    document.querySelector(".container").style.backgroundColor =
      colorMap[key] || "#ffffff";
  }

  updateTheme(themeSelect.value);
  themeSelect.addEventListener("change", () => {
    updateTheme(themeSelect.value);
  });


  function appendMessage(sender, text) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(sender === "user" ? "user-message" : "bot-message");
    wrapper.classList.add("message");

    const p = document.createElement("p");
    p.classList.add("message-text");
    
    p.textContent = sender === "user" ? `너: ${text}` : `핑핑봇: ${text}`;

    wrapper.appendChild(p);
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function updateLastBot(text) {
    const bots = chatBox.querySelectorAll(".bot-message .message-text");
    if (!bots.length) return;
    const last = bots[bots.length - 1];
    last.textContent = `핑핑봇: ${text}`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendToClaude(messages) {
    const res = await fetch("/api/pingping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      throw new Error(`Claude API 오류: ${res.status}`);
    }
    const { reply } = await res.json();
    return reply;
  }

  async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage("user", text);
    userInput.value = "";

    conversation.push({ role: "user", content: text });

    appendMessage("bot", "응답 대기중...");

    try {
      const reply = await sendToClaude(conversation);
      conversation.push({ role: "assistant", content: reply });
      updateLastBot(reply || "응답X");
    } catch (e) {
      console.error(e);
      updateLastBot("서버가 응답하지 않음");
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
    conversation.length = 0;
    userInput.value = "";
    themeSelect.value = "random";
    updateTheme("random");
  });
});
