// src/plugins/countdownWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "countdown",
    name: baseLang === "en" ? "Countdown" : "カウントダウン",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-countdown";

      const title = document.createElement("div");
      title.textContent =
        lang === "en" ? "Countdown" : "カウントダウン";
      title.className = "widget-section-title";

      const labelEl = document.createElement("div");
      labelEl.style.fontSize = "13px";
      labelEl.style.marginBottom = "4px";
      labelEl.style.opacity = "0.85";
      labelEl.textContent =
        lang === "en"
          ? "Not set yet"
          : "まだ設定されていません";

      const timeLabel = document.createElement("div");
      timeLabel.className = "countdown-time";
      timeLabel.textContent = "--:--";

      const sub = document.createElement("div");
      sub.style.fontSize = "12px";
      sub.style.opacity = "0.7";
      sub.textContent = "";

      const setBtn = document.createElement("button");
      setBtn.textContent =
        lang === "en" ? "Set time" : "時間を設定";
      setBtn.className = "widget-button";
      setBtn.style.marginTop = "10px";

      let timerId = null;
      let targetTime = null;
      let label = "";

      function saveState() {
        try {
          const data = targetTime
            ? { targetTime: targetTime, label: label }
            : null;
          localStorage.setItem(
            "standby_countdown_state",
            JSON.stringify(data)
          );
        } catch (e) {}
      }

      function update() {
        if (!targetTime) {
          timeLabel.textContent = "--:--";
          sub.textContent = "";
          return;
        }

        const now = Date.now();
        const diffMs = targetTime - now;

        if (diffMs <= 0) {
          clearInterval(timerId);
          timerId = null;
          timeLabel.textContent = "00:00";
          sub.textContent =
            lang === "en" ? "Finished ✅" : "終了しました ✅";
          return;
        }

        const totalSec = Math.floor(diffMs / 1000);
        const m = String(
          Math.floor(totalSec / 60)
        ).padStart(2, "0");
        const s = String(totalSec % 60).padStart(2, "0");
        timeLabel.textContent = m + ":" + s;
        if (lang === "en") {
          sub.textContent =
            "About " +
            Math.floor(totalSec / 60) +
            " min left";
        } else {
          sub.textContent =
            "残り " + Math.floor(totalSec / 60) + " 分";
        }
      }

      function setupTarget() {
        const promptLabel =
          lang === "en"
            ? "What is this countdown for? (optional)"
            : "何のカウントダウン？（任意）";
        const defaultLabel =
          lang === "en" ? "Study time" : "勉強タイム";

        const newLabel = window.prompt(
          promptLabel,
          label || defaultLabel
        );
        if (newLabel) {
          label = newLabel;
          labelEl.textContent = label;
        }

        const promptMinutes =
          lang === "en"
            ? "How many minutes?"
            : "何分後までカウントダウンする？";
        const defaultMinutes = "30";
        const minutesStr = window.prompt(
          promptMinutes,
          defaultMinutes
        );
        if (!minutesStr) return;

        const minutes = Number(minutesStr);
        if (!Number.isFinite(minutes) || minutes <= 0) {
          window.alert(
            lang === "en"
              ? "Please enter a valid number."
              : "正しい分数を入力してね！"
          );
          return;
        }

        targetTime = Date.now() + minutes * 60 * 1000;
        saveState();

        if (timerId) clearInterval(timerId);
        timerId = setInterval(update, 1000);
        update();
      }

      setBtn.addEventListener("click", setupTarget);

      try {
        const saved = localStorage.getItem(
          "standby_countdown_state"
        );
        if (saved) {
          const data = JSON.parse(saved);
          if (data && data.targetTime) {
            targetTime = data.targetTime;
            label = data.label || "";
            if (label) {
              labelEl.textContent = label;
            }
            if (Date.now() < targetTime) {
              timerId = setInterval(update, 1000);
              update();
            } else {
              targetTime = null;
            }
          }
        }
      } catch (e) {}

      wrapper.appendChild(title);
      wrapper.appendChild(labelEl);
      wrapper.appendChild(timeLabel);
      wrapper.appendChild(sub);
      wrapper.appendChild(setBtn);

      return wrapper;
    },
  });
})();
