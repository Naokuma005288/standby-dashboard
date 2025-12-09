// src/core/widgetManager.js
import { memoWidgetPlugin } from "../plugins/memoWidget.js";
import { helloWidgetPlugin } from "../plugins/helloWidget.js";

const pluginRegistry = [
  memoWidgetPlugin,
  helloWidgetPlugin,
  // ここに新しいプラグインを追加していく
];

let widgetCounter = 1;
const instances = [];

export function setupWidgetPanel() {
  const addBtn = document.getElementById("addWidgetBtn");
  const container = document.getElementById("widgetsContainer");

  if (!addBtn || !container) return;

  addBtn.addEventListener("click", () => {
    const plugin = choosePluginByPrompt();
    if (!plugin) return;
    addWidget(plugin, container);
  });

  // 初期サンプルで1個表示
  addWidget(memoWidgetPlugin, container);
}

function choosePluginByPrompt() {
  const list = pluginRegistry.map((p) => `${p.id}: ${p.name}`).join("\n");

  const input = window.prompt(
    `追加するウィジェットを選んでね:\n${list}\n\n例: memo`,
    "memo",
  );
  if (!input) return null;

  const found = pluginRegistry.find((p) => p.id === input.trim());
  if (!found) {
    window.alert("そのIDのプラグインはないかも…");
    return null;
  }
  return found;
}

function addWidget(plugin, container) {
  const instance = {
    id: widgetCounter++,
    plugin,
  };
  instances.push(instance);

  const card = document.createElement("div");
  card.className = "widget-card";
  card.dataset.id = String(instance.id);

  card.innerHTML = `
    <div class="widget-header">
      <span class="widget-title">${plugin.name}</span>
      <button class="widget-remove" aria-label="ウィジェットを削除">×</button>
    </div>
  `;

  const body = document.createElement("div");
  body.className = "widget-body";
  body.appendChild(plugin.createBodyElement());

  card.appendChild(body);
  container.appendChild(card);

  const removeBtn = card.querySelector(".widget-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      removeWidget(instance.id, container);
    });
  }
}

function removeWidget(id, container) {
  const index = instances.findIndex((w) => w.id === id);
  if (index !== -1) {
    instances.splice(index, 1);
  }

  const card = container.querySelector(`.widget-card[data-id="${id}"]`);
  if (card) {
    container.removeChild(card);
  }
}
