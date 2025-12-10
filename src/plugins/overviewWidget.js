// src/plugins/overviewWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "overview",
    name: baseLang === "en" ? "Dashboard" : "ダッシュボード",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-overview";

      const title = document.createElement("div");
      title.textContent =
        lang === "en" ? "Dashboard" : "ダッシュボード";
      title.className = "widget-section-title";

      const desc = document.createElement("div");
      desc.style.fontSize = "11px";
      desc.style.opacity = "0.75";
      desc.style.marginBottom = "8px";
      desc.textContent =
        lang === "en"
          ? "Rough overview of memo / to-do / countdown."
          : "メモ・TODO・カウントダウンのざっくり状況。";

      const metricsContainer = document.createElement("div");
      metricsContainer.style.marginTop = "4px";

      function createMetric(label, valueText, ratio) {
        const row = document.createElement("div");
        row.className = "overview-metric";

        const left = document.createElement("span");
        left.textContent = label;

        const right = document.createElement("span");
        right.textContent = valueText;
        right.style.fontSize = "12px";
        right.style.opacity = "0.9";

        row.appendChild(left);
        row.appendChild(right);

        const bar = document.createElement("div");
        bar.className = "overview-bar";

        const fill = document.createElement("div");
        fill.className = "overview-bar-fill";
        fill.style.transform =
          "scaleX(" + Math.max(0, Math.min(1, ratio)) + ")";

        bar.appendChild(fill);

        const container = document.createElement("div");
        container.appendChild(row);
        container.appendChild(bar);
        container.style.marginBottom = "8px";

        return container;
      }

      let memoLen = 0;
      try {
        const memo = localStorage.getItem("standby_memo_text");
        if (memo) memoLen = memo.length;
      } catch (e) {}

      let todoTotal = 0;
      let todoDone = 0;
      try {
        const todoRaw = localStorage.getItem(
          "standby_todo_items"
        );
        if (todoRaw) {
          const arr = JSON.parse(todoRaw);
          if (Array.isArray(arr)) {
            todoTotal = arr.length;
            todoDone = arr.filter(function (it) {
              return it && it.done;
            }).length;
          }
        }
      } catch (e) {}

      let countdownLabel =
        lang === "en" ? "Not set" : "未設定";
      try {
        const raw = localStorage.getItem(
          "standby_countdown_state"
        );
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && obj.targetTime) {
            const restMs = obj.targetTime - Date.now();
            if (restMs > 0) {
              const min = Math.floor(restMs / 60000);
              if (lang === "en") {
                countdownLabel = min + " min left";
              } else {
                countdownLabel = "残り " + min + " 分";
              }
            } else {
              countdownLabel =
                lang === "en" ? "Finished" : "終了済み";
            }
          }
        }
      } catch (e) {}

      const memoMetric = createMetric(
        lang === "en" ? "Memo" : "メモ",
        lang === "en"
          ? memoLen + " chars"
          : memoLen + " 文字",
        Math.min(memoLen / 200, 1)
      );

      const todoMetric = createMetric(
        lang === "en" ? "To-do" : "TODO",
        todoDone + " / " + todoTotal,
        todoTotal ? todoDone / todoTotal : 0
      );

      const cdMetric = createMetric(
        lang === "en" ? "Countdown" : "カウントダウン",
        countdownLabel,
        0.6
      );

      metricsContainer.appendChild(memoMetric);
      metricsContainer.appendChild(todoMetric);
      metricsContainer.appendChild(cdMetric);

      wrapper.appendChild(title);
      wrapper.appendChild(desc);
      wrapper.appendChild(metricsContainer);

      return wrapper;
    },
  });
})();
