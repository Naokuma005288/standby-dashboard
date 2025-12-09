// src/main.js

document.addEventListener("DOMContentLoaded", function () {
  if (window.setupClock) {
    window.setupClock();
  }
  if (window.setupWidgetPanel) {
    window.setupWidgetPanel();
  }
});
