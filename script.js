const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const endpoint = isLocal
  ? "http://localhost:3001/pingping"
  : "/api/pingping";


async function sendToClaude(messages) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const { reply } = await res.json();
  return reply;
}

document.addEventListener("DOMContentLoaded", () => {

  const themeSelect  = document.getElementById("themeSelect");
  const pingpingMood = document.getElementById("pingpingMood");
  const container    = document.querySelector(".container");
  const botBox       = document.getElementById("botResponse");
  const userInput    = document.getElementById("userInput");
  const submitBtn    = document.getElementById("submitBtn");
  const clearBtn     = document.getElementById("clearBtn");

  const moodMap = {
    random:  "어떤 핑핑이랑 얘기할까?",
    joy:     "😊 Joy",
    sadness: "😢 Sadness",
    anger:   "😡 Anger",
    disgust: "🤢 Disgust",
    fear:    "😱 Fear"
  };
  const colorMap = {
    random:  "#ffffff",
    joy:     "#fff7e6",
    sadness: "#e6f7ff",
    anger:   "#ffe6e6",
    disgust: "#e6ffe6",
    fear:    "#f2e6ff"
  };


  updateMood(themeSelect.value);


  themeSelect.addEventListener("change", () => {
    updateMood(themeSelect.value);
  });


  clearBtn.addEventListener("click", () => {
    botBox.innerHTML = "";
  });


  submitBtn.addEventListener("click", sendMessage);


  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });


  async function sendMessage() {
    const txt = userInput.value.trim();
    if (!txt) return;

    appendMessage("user", txt);
    userInput.value = "";
    appendMessage("bot", "…응답 대기 중");

    try {
      const rep = await sendToClaude([{ role: "user", content: txt }]);
      updateLastBot(rep);
    } catch (err) {
      console.error(err);
      updateLastBot("❌ 서버가 응답하지 않음");
    }
  }

  function updateMood(key) {
    pingpingMood.textContent = `오늘 핑핑이의 감정 상태: ${moodMap[key]}`;
    container.style.backgroundColor = colorMap[key];
    container.classList.remove(
      "mood-random","mood-joy","mood-sadness",
      "mood-anger","mood-disgust","mood-fear"
    );
    container.classList.add(`mood-${key}`);
  }

  function appendMessage(who, msg) {
    const div = document.createElement("div");
    div.className = who === "user" ? "user-message" : "bot-message";
    div.textContent = (who === "user" ? "너: " : "핑핑봇: ") + msg;
    botBox.append(div);
    div.scrollIntoView({ block: "end" });
  }

  function updateLastBot(msg) {
    const bots = botBox.querySelectorAll(".bot-message");
    if (bots.length) bots[bots.length - 1].textContent = `핑핑봇: ${msg}`;
  }
});
