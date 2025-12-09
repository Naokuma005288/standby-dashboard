// src/plugins/helloWidget.js

export const helloWidgetPlugin = {
  id: "hello",
  name: "今日のひとこと",

  createBodyElement() {
    const wrapper = document.createElement("div");
    const p = document.createElement("p");

    const now = new Date();
    const hour = now.getHours();

    let msg = "いい一日を ✨";
    if (hour < 5) msg = "夜更かししすぎ注意…🌙";
    else if (hour < 11) msg = "おはよう！☀️";
    else if (hour < 18) msg = "午後もがんばろ〜📚";
    else msg = "今日もおつかれさま🍵";

    p.textContent = msg;
    wrapper.appendChild(p);
    return wrapper;
  },
};
