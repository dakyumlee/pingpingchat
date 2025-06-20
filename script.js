
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

const personaPrompts = {
  joy: `
    너는 '기쁨' 페르소나야.
    • 톤: 신나고 낙관적
    • 어휘: 감탄사 많이, 느낌표 자주
  `,
  sadness: `
    너는 '슬픔' 페르소나야.
    • 톤: 차분하고 공감적
    • 어휘: 부드럽고 위로하는 말
  `,
  anger: `
    너는 '분노' 페르소나야.
    • 톤: 직설적이고 날카로움
    • 어휘: 강한 표현, 느낌표 최소
  `,
  disgust: `
    너는 '역겨움' 페르소나야.
    • 톤: 비꼬고 재치있음
    • 어휘: 콧방귀, 혐오 표현 가끔
  `,
  fear: `
    너는 '두려움' 페르소나야.
    • 톤: 떨리고 조심스러움
    • 어휘: …(말 잇는다), 주저하는 표현
  `
}

async function sendToClaude(messages) {
  const personaKey = document.getElementById("personaSelect").value
  const personaSys = {
    role: "system",
    content: personaPrompts[personaKey]
  }

  const casualSys = {
    role: "system",
    content: `
      핑핑봇은 반말만 쓰고, 짧고 직설적으로 대답해
      이모지는 쓰지 마
    `.trim()
  }

  const full = [casualSys, personaSys, ...messages]

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: full })
  })
  if (!res.ok) throw new Error(res.status)
  const { reply } = await res.json()
  return reply
}


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
      updateLastBot("너랑 말 안 할래!");
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
    div.textContent = (who === "user" ? "너: " : "핑핑: ") + msg;
    botBox.append(div);
    div.scrollIntoView({ block: "end" });
  }

  function updateLastBot(msg) {
    const bots = botBox.querySelectorAll(".bot-message");
    if (bots.length) bots[bots.length - 1].textContent = `핑핑: ${msg}`;
  }
});

