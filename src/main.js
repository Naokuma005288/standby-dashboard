// src/main.js
import { setupClock } from "./core/clock.js";
import { setupWidgetPanel } from "./core/widgetManager.js";

document.addEventListener("DOMContentLoaded", () => {
  setupClock();
  setupWidgetPanel();
});
