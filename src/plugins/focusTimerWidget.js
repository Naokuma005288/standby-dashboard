// src/plugins/focusTimerWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "focusTimer",
    name: baseLang === "en" ? "Focus Timer" : "集中タイマー",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-focus";

      const title = document.createElement("div");
      title.textContent =
        lang === "en" ? "Focus Timer" : "集中タイマー";
      title.className = "widget-section-title";

      const timeEl = document.createElement("div");
      timeEl.className = "focus-time";
      timeEl.textContent = "00:00:00";

      const sub = document.createElement("div");
      sub.style.fontSize = "11px";
      sub.style.opacity = "0.8";
      sub.style.marginBottom = "8px";
      sub.textContent =
        lang === "en"
          ? "Track study / work time with Start."
          : "「スタート」で勉強 / 作業時間をざっくり計測。";

      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "8px";
      btnRow.style.marginTop = "4px";

      const startBtn = document.createElement("button");
      startBtn.textContent =
        lang === "en" ? "Start" : "スタート";
      startBtn.className = "widget-button";

      const stopBtn = document.createElement("button");
      stopBtn.textContent =
        lang === "en" ? "Stop" : "ストップ";
      stopBtn.className = "widget-button";

      const resetBtn = document.createElement("button");
      resetBtn.textContent =
        lang === "en" ? "Reset" : "リセット";
      resetBtn.className = "widget-button";

      btnRow.appendChild(startBtn);
      btnRow.appendChild(stopBtn);
      btnRow.appendChild(resetBtn);

      const totalLabel = document.createElement("div");
      totalLabel.style.fontSize = "11px";
      totalLabel.style.opacity = "0.75";
      totalLabel.style.marginTop = "8px";

      let startTime = null;
      let elapsed = 0; // ms
      let timerId = null;

      function format(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = String(
          Math.floor(totalSec / 3600)
        ).padStart(2, "0");
        const m = String(
          Math.floor((totalSec % 3600) / 60)
        ).padStart(2, "0");
        const s = String(totalSec % 60).padStart(2, "0");
        return h + ":" + m + ":" + s;
      }

      function updateDisplay() {
        const ms =
          elapsed + (startTime ? Date.now() - startTime : 0);
        timeEl.textContent = format(ms);
      }

      function loadTotalToday() {
        try {
          const todayKey = new Date()
            .toISOString()
            .slice(0, 10);
          const raw = localStorage.getItem(
            "standby_focus_total_" + todayKey
          );
          if (!raw) return 0;
          const n = Number(raw);
          return Number.isFinite(n) ? n : 0;
        } catch (e) {
          return 0;
        }
      }

      function saveTotalToday(deltaMs) {
        try {
          const todayKey = new Date()
            .toISOString()
            .slice(0, 10);
          const current = loadTotalToday();
          const next = current + deltaMs;
          localStorage.setItem(
            "standby_focus_total_" + todayKey,
            String(next)
          );
          updateTotalLabel();
        } catch (e) {}
      }

      function updateTotalLabel() {
        const total = loadTotalToday();
        const totalMin = Math.floor(total / 60000);
        totalLabel.textContent =
          lang === "en"
            ? "Today total: ~" + totalMin + " min"
            : "今日の累計: 約 " + totalMin + " 分";
      }

      function start() {
        if (timerId) return;
        startTime = Date.now();
        timerId = setInterval(updateDisplay, 1000);
      }

      function stop() {
        if (!timerId) return;
        clearInterval(timerId);
        timerId = null;
        if (startTime) {
          const delta = Date.now() - startTime;
          elapsed += delta;
          saveTotalToday(delta);
          startTime = null;
        }
        updateDisplay();
      }

      function reset() {
        stop();
        elapsed = 0;
        updateDisplay();
      }

      startBtn.addEventListener("click", start);
      stopBtn.addEventListener("click", stop);
      resetBtn.addEventListener("click", reset);

      updateDisplay();
      updateTotalLabel();

      wrapper.appendChild(title);
      wrapper.appendChild(timeEl);
      wrapper.appendChild(sub);
      wrapper.appendChild(btnRow);
      wrapper.appendChild(totalLabel);

      return wrapper;
    },
  });
})();
