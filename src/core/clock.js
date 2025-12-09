// src/core/clock.js

const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

export function setupClock() {
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");

  if (!timeEl || !dateEl) return;

  function updateClock() {
    const now = new Date();

    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    timeEl.textContent = `${h}:${m}`;

    const w = weekdayLabels[now.getDay()];
    dateEl.textContent = `${now.getFullYear()}年${
      now.getMonth() + 1
    }月${now.getDate()}日(${w})`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}
