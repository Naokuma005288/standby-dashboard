// src/main.js

document.addEventListener("DOMContentLoaded", function () {
  initLangToggle();

  if (window.setupClock) {
    window.setupClock();
  }
  if (window.setupWidgetPanel) {
    window.setupWidgetPanel();
  }
  if (window.setupPlayer) {
    window.setupPlayer();
  }
});

function initLangToggle() {
  var lang = window.STANDBY_LANG === "en" ? "en" : "ja";
  var jaBtn = document.getElementById("langJaBtn");
  var enBtn = document.getElementById("langEnBtn");

  function updateButtons() {
    if (jaBtn) {
      jaBtn.classList.toggle("active", lang === "ja");
    }
    if (enBtn) {
      enBtn.classList.toggle("active", lang === "en");
    }
  }

  updateButtons();

  if (jaBtn) {
    jaBtn.addEventListener("click", function () {
      if (window.STANDBY_LANG === "ja") return;
      try {
        localStorage.setItem("standby_lang", "ja");
      } catch (e) {}
      location.reload();
    });
  }

  if (enBtn) {
    enBtn.addEventListener("click", function () {
      if (window.STANDBY_LANG === "en") return;
      try {
        localStorage.setItem("standby_lang", "en");
      } catch (e) {}
      location.reload();
    });
  }
}
