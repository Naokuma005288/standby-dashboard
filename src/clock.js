// src/clock.js

(function () {
  function setupClock() {
    var lang = window.STANDBY_LANG === "en" ? "en" : "ja";

    var elHours = document.getElementById("time-hours");
    var elMinutes = document.getElementById("time-minutes");
    var elSeconds = document.getElementById("time-seconds");
    var elWeekday = document.getElementById("clock-weekday");
    var elDate = document.getElementById("date");
    var elGreeting = document.getElementById("clock-greeting");

    var elDayLabel = document.getElementById("time-of-day-label");
    var elDayProgressLabel = document.getElementById("day-progress-label");
    var elDayProgressBar = document.getElementById("day-progress-bar-fill");

    var elTokyo = document.getElementById("world-tokyo-time");
    var elLondon = document.getElementById("world-london-time");
    var elNY = document.getElementById("world-ny-time");

    var panel = document.querySelector(".clock-panel");

    if (
      !elHours ||
      !elMinutes ||
      !elSeconds ||
      !elWeekday ||
      !elDate ||
      !elDayLabel ||
      !elDayProgressLabel ||
      !elDayProgressBar ||
      !panel
    ) {
      return;
    }

    function pad2(n) {
      return String(n).padStart(2, "0");
    }

    function getWeekdayName(lang, idx) {
      if (lang === "en") {
        var enNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return enNames[idx] || "";
      } else {
        var jaNames = ["日", "月", "火", "水", "木", "金", "土"];
        return jaNames[idx] + "曜";
      }
    }

    function formatDateString(lang, d) {
      var y = d.getFullYear();
      var m = d.getMonth() + 1;
      var day = d.getDate();
      if (lang === "en") {
        // 2025-12-10
        return y + "-" + pad2(m) + "-" + pad2(day);
      } else {
        // 2025年12月10日
        return (
          y +
          "年" +
          m +
          "月" +
          day +
          "日"
        );
      }
    }

    function getTimeOfDayInfo(lang, hour) {
      var key;
      if (hour < 5) key = "night";
      else if (hour < 10) key = "morning";
      else if (hour < 17) key = "day";
      else if (hour < 20) key = "evening";
      else key = "night";

      var label;
      if (lang === "en") {
        if (key === "morning") label = "Morning";
        else if (key === "day") label = "Daytime";
        else if (key === "evening") label = "Evening";
        else label = "Night";
      } else {
        if (key === "morning") label = "朝";
        else if (key === "day") label = "昼";
        else if (key === "evening") label = "夕方";
        else label = "夜";
      }
      return { key: key, label: label };
    }

    function getGreeting(lang, hour) {
      if (lang === "en") {
        if (hour >= 5 && hour < 11) return "Good morning ☀️";
        if (hour >= 11 && hour < 17) return "Good afternoon 🌤";
        if (hour >= 17 && hour < 22) return "Good evening 🌙";
        return "Good night mode 😴";
      } else {
        if (hour >= 5 && hour < 11) return "おはよう ☀️";
        if (hour >= 11 && hour < 17) return "こんにちは 🌤";
        if (hour >= 17 && hour < 22) return "こんばんは 🌙";
        return "おやすみモードでもいいかも 😴";
      }
    }

    var lastThemeKey = null;

    function updateTheme(hour) {
      var info = getTimeOfDayInfo(lang, hour);
      var key = info.key;

      if (lastThemeKey === key) return;
      lastThemeKey = key;

      panel.classList.remove(
        "clock-theme-morning",
        "clock-theme-day",
        "clock-theme-evening",
        "clock-theme-night"
      );
      panel.classList.add("clock-theme-" + key);
    }

    function updateDayProgress(now) {
      var seconds =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds();
      var total = 24 * 3600;
      var p = seconds / total;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      elDayProgressBar.style.transform = "scaleX(" + p + ")";
      var percent = Math.round(p * 100);

      if (lang === "en") {
        elDayProgressLabel.textContent = percent + "% passed";
      } else {
        elDayProgressLabel.textContent = percent + "% 経過";
      }

      var info = getTimeOfDayInfo(lang, now.getHours());
      elDayLabel.textContent = info.label;
    }

    function updateWorldClocks(now) {
      if (!elTokyo || !elLondon || !elNY) return;

      // ローカル → UTC
      var utcMs = now.getTime() + now.getTimezoneOffset() * 60000;

      function setWorld(el, offsetHours) {
        if (!el) return;
        var t = new Date(utcMs + offsetHours * 3600000);
        el.textContent = pad2(t.getHours()) + ":" + pad2(t.getMinutes());
      }

      // DSTはざっくり無視（簡易実装）
      setWorld(elTokyo, 9);   // Tokyo UTC+9
      setWorld(elLondon, 0);  // London UTC+0（ざっくり）
      setWorld(elNY, -5);     // New York UTC-5（ざっくり）
    }

    function tick() {
      var now = new Date();
      var h = now.getHours();
      var m = now.getMinutes();
      var s = now.getSeconds();

      elHours.textContent = pad2(h);
      elMinutes.textContent = pad2(m);
      elSeconds.textContent = pad2(s);

      var wd = now.getDay();
      elWeekday.textContent = getWeekdayName(lang, wd);
      elDate.textContent = formatDateString(lang, now);

      if (elGreeting) {
        elGreeting.textContent = getGreeting(lang, h);
      }

      updateTheme(h);
      updateDayProgress(now);
      updateWorldClocks(now);
    }

    // 初期表示
    tick();
    setInterval(tick, 1000);
  }

  window.setupClock = setupClock;
})();
