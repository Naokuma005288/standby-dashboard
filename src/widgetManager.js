// src/widgetManager.js

(function () {
  let widgetCounter = 1;
  const instances = [];

  function setupWidgetPanel() {
    const addBtn = document.getElementById("addWidgetBtn");
    const container = document.getElementById("widgetsContainer");

    if (!addBtn || !container) return;

    addBtn.addEventListener("click", function () {
      const plugin = choosePluginByPrompt();
      if (!plugin) return;
      addWidget(plugin, container);
    });

    // 初期サンプルで1個出しておく
    const defaultPlugin = (window.WidgetPlugins || []).find(
      (p) => p.id === "memo",
    );
    if (defaultPlugin) {
      addWidget(defaultPlugin, container);
    }
  }

  function choosePluginByPrompt() {
    const registry = window.WidgetPlugins || [];
    if (!registry.length) {
      alert("利用可能なウィジェットがないよ…");
      return null;
    }

    const list = registry.map((p) => `${p.id}: ${p.name}`).join("\n");
    const input = window.prompt(
      `追加するウィジェットを選んでね:\n${list}\n\n例: memo`,
      "memo",
    );
    if (!input) return null;

    const found = registry.find((p) => p.id === input.trim());
    if (!found) {
      alert("そのIDのウィジェットはないかも…");
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
      removeBtn.addEventListener("click", function () {
        removeWidget(instance.id, container);
      });
    }
  }

  function removeWidget(id, container) {
    const idx = instances.findIndex((w) => w.id === id);
    if (idx !== -1) {
      instances.splice(idx, 1);
    }

    const card = container.querySelector(`.widget-card[data-id="${id}"]`);
    if (card) {
      container.removeChild(card);
    }
  }

  // グローバルに公開
  window.setupWidgetPanel = setupWidgetPanel;
})();
