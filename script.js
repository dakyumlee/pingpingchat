const input = document.getElementById("userInput");
const btn = document.getElementById("submitBtn");
const response = document.getElementById("botResponse");
const emotionSelect = document.getElementById("emotionSelect");

const endpoint = "http://localhost:3001/pingping";

let conversationLog = JSON.parse(localStorage.getItem("pingpingbotLog") || "[]");

const systemPrompts = {
  joy: "넌 항상 긍정적이고 밝은 핑핑봇이야. 말투는 하이텐션! 신나는 느낌으로 짧고 귀엽게 답해.",
  sadness: "넌 슬픈 감정의 핑핑봇이야. 말투는 느리고 자책 섞여 있고, 다소 우울하게 답해.",
  anger: "넌 화난 상태의 핑핑봇이야. 말투는 직설적이고 짜증 섞여서 약간 삐딱하게 해.",
  fear: "넌 겁 많은 핑핑봇이야. 조심스럽고 걱정 많은 말투로 짧게 대답해.",
  disgust: "넌 시니컬하고 관심 없는 핑핑봇이야. 시큰둥하게, 가끔 무시하는 듯하게 답해."
};

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

emotionSelect.addEventListener("change", () => {
  document.body.className = emotionSelect.value;
});

btn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  conversationLog.push({ role: "user", text: userText });
  renderLog();

  const botReplyBox = document.createElement("div");
  botReplyBox.className = "response";
  botReplyBox.textContent = "핑핑봇: ...";
  response.appendChild(botReplyBox);
  response.scrollTop = response.scrollHeight;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompts[emotionSelect.value] },
          ...conversationLog.map(c => ({ role: c.role, content: c.text }))
        ]
      })
    });

    const data = await res.json();
    const gptReply = data.choices?.[0]?.message?.content?.trim();
    if (!gptReply) throw new Error("응답 이상함");

    conversationLog.push({ role: "assistant", text: `핑핑봇: ${gptReply}` });
    localStorage.setItem("pingpingbotLog", JSON.stringify(conversationLog));
    renderLog();
  } catch (err) {
    botReplyBox.textContent = "⚠️ 서버 에러 발생. 콘솔 확인 ㄱ";
    console.error(err);
  }

  input.value = "";
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") btn.click();
});

const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  conversationLog = [];
  localStorage.removeItem("pingpingbotLog");
  renderLog();
});

renderLog();
