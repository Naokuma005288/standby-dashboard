// src/plugins/moodWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "mood",
    name: baseLang === "en" ? "Mood Tracker" : "ムードトラッカー",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-mood";

      const title = document.createElement("div");
      title.textContent =
        lang === "en" ? "Mood Tracker" : "ムードトラッカー";
      title.className = "widget-section-title";

      const display = document.createElement("div");
      display.className = "mood-display";
      display.textContent = "🙂";

      const label = document.createElement("div");
      label.className = "mood-label";
      label.textContent =
        lang === "en"
          ? "How do you feel now?"
          : "いまの気分はどう？";

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "1";
      slider.max = "5";
      slider.step = "1";
      slider.style.marginTop = "12px";
      slider.style.width = "100%";

      const moodMapJa = {
        1: { emoji: "😵", text: "今日はきつい…無理しないで。" },
        2: { emoji: "😕", text: "ちょい微妙…。休憩はさみつつ。" },
        3: { emoji: "🙂", text: "そこそこ。マイペースでOK。" },
        4: { emoji: "😄", text: "いい感じ！この調子 ✨" },
        5: { emoji: "🤩", text: "爆アゲ。なんでもできそう。" },
      };

      const moodMapEn = {
        1: { emoji: "😵", text: "Today feels rough. Go easy on yourself." },
        2: { emoji: "😕", text: "Not great. Take some breaks." },
        3: { emoji: "🙂", text: "Pretty okay. Stay steady." },
        4: { emoji: "😄", text: "Nice! Keep that flow ✨" },
        5: { emoji: "🤩", text: "Hype mode. You can do anything." },
      };

      function updateFromValue(v) {
        const map = lang === "en" ? moodMapEn : moodMapJa;
        const item = map[v] || map[3];
        display.textContent = item.emoji;
        label.textContent = item.text;

        try {
          localStorage.setItem(
            "standby_mood_value",
            String(v)
          );
        } catch (e) {}
      }

      try {
        const saved = localStorage.getItem("standby_mood_value");
        if (saved) {
          slider.value = saved;
        } else {
          slider.value = "3";
        }
      } catch (e) {
        slider.value = "3";
      }

      updateFromValue(slider.value);

      slider.addEventListener("input", function () {
        updateFromValue(slider.value);
      });

      wrapper.appendChild(title);
      wrapper.appendChild(display);
      wrapper.appendChild(label);
      wrapper.appendChild(slider);
      return wrapper;
    },
  });
})();
