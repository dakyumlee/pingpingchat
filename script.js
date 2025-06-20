
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const endpoint = isLocal
  ? "http://localhost:3001/pingping"
  : "/api/pingping";

const personaPrompts = {
  random: `
    너는 핑핑봇이야.
    반말만 사용해. 존댓말 쓰지 마.
    짧고 직설적으로 대답해.
  `,
  joy: `
    너는 '기쁨' 페르소나야.
    반말만 사용해. 존댓말 금지.
    톤: 신나고 낙관적.
    감탄사+느낌표 잔뜩!
  `,
  sadness: `
    너는 '슬픔' 페르소나야.
    반말만 사용해. 존댓말 금지.
    톤: 차분하고 공감적.
    부드럽게 위로해 줘.
  `,
  anger: `
    너는 '분노' 페르소나야.
    반말만 사용해. 존댓말 금지.
    톤: 직설적이고 날카로워.
    강한 표현 써도 돼.
  `,
  disgust: `
    너는 '역겨움' 페르소나야.
    반말만 사용해. 존댓말 금지.
    톤: 비꼬고 재치 있어.
    혐오 표현 가끔 사용.
  `,
  fear: `
    너는 '두려움' 페르소나야.
    반말만 사용해. 존댓말 금지.
    톤: 떨리고 조심스러워.
    주저하는 말투 많이 써.
  `
};


async function sendToClaude(userMessages) {
  const key = document.getElementById("themeSelect").value;
  const systemMsg = {
    role: "system",
    content: personaPrompts[key] || personaPrompts.random
  };
  const full = [systemMsg, ...userMessages];

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: full })
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data = await res.json();

  return data.reply;
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
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    userInput.value = "";

    const botDiv = appendMessage("bot", "…응답 대기 중");

    try {
      const reply = await sendToClaude([{ role: "user", content: text }]);

      botDiv.textContent = `핑핑봇: ${reply}`;
    } catch (err) {
      console.error(err);
      botDiv.textContent = `핑핑봇: ❌ 서버가 응답하지 않음`;
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
    return div; 
  }
});
