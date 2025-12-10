// src/plugins/memoWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "memo",
    name: baseLang === "en" ? "Memo" : "メモ",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-memo";

      const title = document.createElement("div");
      title.textContent = lang === "en" ? "Memo" : "メモ";
      title.className = "widget-section-title";

      const textarea = document.createElement("textarea");
      textarea.placeholder =
        lang === "en"
          ? "Write a quick note…"
          : "メモを書く…";

      const counter = document.createElement("div");
      counter.className = "memo-counter";

      try {
        const saved = localStorage.getItem("standby_memo_text");
        if (saved) {
          textarea.value = saved;
        }
      } catch (e) {}

      function updateCounterAndSave() {
        const len = textarea.value.length;
        counter.textContent =
          lang === "en" ? len + " chars" : len + " 文字";
        try {
          localStorage.setItem("standby_memo_text", textarea.value);
        } catch (e) {}
      }

      textarea.addEventListener("input", updateCounterAndSave);
      updateCounterAndSave();

      wrapper.appendChild(title);
      wrapper.appendChild(textarea);
      wrapper.appendChild(counter);
      return wrapper;
    },
  });
})();
