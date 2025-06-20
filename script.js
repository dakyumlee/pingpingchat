const input = document.getElementById("userInput");
const btn = document.getElementById("submitBtn");
const responseContainer = document.getElementById("botResponse");
const moodBox = document.getElementById("pingpingMood");
const clearBtn = document.getElementById("clearBtn");
const themeSelect = document.getElementById("themeSelect");

const endpoint = "/api/pingping";

let conversationLog = JSON.parse(localStorage.getItem("pingpingLog") || "[]");

const emotions = [
  { mood: "😄 Joy", theme: "joy" },
  { mood: "😢 Sadness", theme: "sadness" },
  { mood: "😡 Anger", theme: "anger" },
  { mood: "🤢 Disgust", theme: "disgust" },
  { mood: "😱 Fear", theme: "fear" },
];

function applyTheme(themeKey) {
  emotions.forEach(e => document.body.classList.remove(e.theme));
  const sel = emotions.find(e => e.theme === themeKey);
  if (!sel) return;
  document.body.classList.add(themeKey);
  moodBox.textContent = `오늘 핑핑이의 감정 상태: ${sel.mood}`;
  themeSelect.value = themeKey;
}

function setRandomTheme() {
  const { mood, theme } = emotions[Math.floor(Math.random() * emotions.length)];
  applyTheme(theme);
}

themeSelect.addEventListener("change", () => {
  themeSelect.value === "random" ? setRandomTheme() : applyTheme(themeSelect.value);
});

// 초기 테마 랜덤 설정
setRandomTheme();

function renderLog() {
  responseContainer.innerHTML = "";
  conversationLog.forEach(({role, text}) => {
    const msg = document.createElement("div");
    msg.className = role === "user" ? "user-msg" : "response";
    msg.textContent = text;
    responseContainer.appendChild(msg);
  });
  responseContainer.scrollTop = responseContainer.scrollHeight;
}

btn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  conversationLog.push({ role: "user", text: userText });
  renderLog();

  const waitingDiv = document.createElement("div");
  waitingDiv.className = "response waiting";
  waitingDiv.textContent = "핑핑봇: ...생각 중...";
  responseContainer.appendChild(waitingDiv);
  responseContainer.scrollTop = responseContainer.scrollHeight;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "너는 감정 테마 기반 병맛 챗봇 핑핑이야. 짧고 시니컬한 대답을 해." },
          ...conversationLog.map(c => ({ role: c.role, content: c.text }))
        ]
      })
    });

    const data = await res.json();
    const gptReply = data.choices?.[0]?.message?.content?.trim() || "⚠️ 응답 없음. 콘솔 확인 ㄱ";

    conversationLog.push({ role: "assistant", text: `핑핑봇: ${gptReply}` });
    localStorage.setItem("pingpingLog", JSON.stringify(conversationLog));
    renderLog();

  } catch (err) {
    waitingDiv.textContent = "❌ 서버가 응답하지 않음";
    console.error("🔥 fetch 실패:", err);
  }

  input.value = "";
});

input.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });

clearBtn.addEventListener("click", () => {
  conversationLog = [];
  localStorage.removeItem("pingpingLog");
  renderLog();
});

// 초기 로그 렌더
renderLog();
