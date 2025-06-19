const input = document.getElementById("userInput");
const btn = document.getElementById("submitBtn");
const response = document.getElementById("botResponse");
const moodBox = document.getElementById("pingpingMood");
const clearBtn = document.getElementById("clearBtn");
const themeSelect = document.getElementById("themeSelect");

const endpoint = "https://pingpingproxy.onrender.com/pingping";

let conversationLog = JSON.parse(localStorage.getItem("pingpingLog") || "[]");

const emotions = [
  { mood: "😄 Joy", theme: "joy" },
  { mood: "😢 Sadness", theme: "sadness" },
  { mood: "😡 Anger", theme: "anger" },
  { mood: "🤢 Disgust", theme: "disgust" },
  { mood: "😱 Fear", theme: "fear" },
];

function applyTheme(themeKey) {
  const selected = emotions.find(e => e.theme === themeKey);
  if (!selected) return;
  document.body.className = themeKey;
  moodBox.textContent = `오늘 핑핑이의 감정 상태: ${selected.mood}`;
}

function setRandomTheme() {
  const { mood, theme } = emotions[Math.floor(Math.random() * emotions.length)];
  document.body.className = theme;
  moodBox.textContent = `오늘 핑핑이의 감정 상태: ${mood}`;
  themeSelect.value = "random";
}

themeSelect.addEventListener("change", () => {
  const selected = themeSelect.value;
  if (selected === "random") {
    setRandomTheme();
  } else {
    applyTheme(selected);
  }
});

setRandomTheme();

function renderLog() {
  response.innerHTML = "";
  for (const { role, text } of conversationLog) {
    const msg = document.createElement("div");
    msg.className = role === "user" ? "user-msg" : "response";
    msg.textContent = text;
    response.appendChild(msg);
  }
  response.scrollTop = response.scrollHeight;
}

btn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  conversationLog.push({ role: "user", text: userText });
  renderLog();

  const botReplyBox = document.createElement("div");
  botReplyBox.className = "response waiting";
  botReplyBox.textContent = "핑핑봇: ...생각 중...";
  response.appendChild(botReplyBox);
  response.scrollTop = response.scrollHeight;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "너는 핑핑이라는 감정 기반 병맛 챗봇이야. 인사이드 아웃 감정 테마를 기반으로 한 시니컬하고 짧은 대답을 해."
          },
          ...conversationLog.map(c => ({ role: c.role, content: c.text }))
        ]
      })
    });

    const data = await res.json();

    const gptReply = data.reply?.trim() || "⚠️ 핑핑 응답 이상함. 콘솔 확인 ㄱ";

    conversationLog.push({ role: "assistant", text: `핑핑봇: ${gptReply}` });
    localStorage.setItem("pingpingLog", JSON.stringify(conversationLog));
    renderLog();
  } catch (err) {
    botReplyBox.textContent = "❌ 서버가 응답하지 않음";
    console.error("🔥 fetch 실패:", err);
  }

  input.value = "";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btn.click();
});

clearBtn.addEventListener("click", () => {
  conversationLog = [];
  localStorage.removeItem("pingpingLog");
  renderLog();
});
