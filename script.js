// script.js
const input = document.getElementById("userInput");
const btn = document.getElementById("submitBtn");
const response = document.getElementById("botResponse");
const moodBox = document.getElementById("pingpingMood");
const clearBtn = document.getElementById("clearBtn");
const themeSelect = document.getElementById("themeSelect");
const endpoint = "/api/pingping";

let conversationLog = [];

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
  if (selected === "random") setRandomTheme();
  else applyTheme(selected);
});

function renderLog() {
  response.innerHTML = "";
  conversationLog.forEach(({ role, text }) => {
    const msg = document.createElement("div");
    msg.className = role === "user" ? "user-msg" : "response";
    msg.textContent = text;
    response.appendChild(msg);
  });
  response.scrollTop = response.scrollHeight;
}

btn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  conversationLog.push({ role: "user", text: userText });
  renderLog();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "너는 병맛 챗봇 핑핑이야. 짧고 시니컬하게 대답해." },
          ...conversationLog.map(({ role, text }) => ({ role, content: text })),
        ],
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "⚠️ 응답 없음. 콘솔 확인 ㄱ";
    conversationLog.push({ role: "assistant", text: `핑핑봇: ${reply}` });
    renderLog();
  } catch (err) {
    console.error("🔥 fetch 실패:", err);
    conversationLog.push({ role: "assistant", text: "❌ 서버가 응답하지 않음" });
    renderLog();
  }

  input.value = "";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btn.click();
});

clearBtn.addEventListener("click", () => {
  conversationLog = [];
  renderLog();
});

setRandomTheme();
