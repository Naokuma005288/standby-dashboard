// src/plugins/todoWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "todo",
    name: baseLang === "en" ? "To-do" : "TODOリスト",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-todo";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "6px";

      const title = document.createElement("div");
      title.textContent =
        lang === "en" ? "To-do list" : "TODOリスト";
      title.className = "widget-section-title";

      const info = document.createElement("div");
      info.style.fontSize = "11px";
      info.style.opacity = "0.7";

      header.appendChild(title);
      header.appendChild(info);

      const form = document.createElement("form");
      form.style.display = "flex";
      form.style.gap = "6px";
      form.style.marginBottom = "8px";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder =
        lang === "en"
          ? "Type a task…"
          : "やることを入力…";
      input.style.flex = "1";
      input.style.borderRadius = "999px";
      input.style.border = "none";
      input.style.padding = "6px 10px";
      input.style.background = "rgba(15,23,42,0.9)";
      input.style.color = "#f5f5f5";

      const addBtn = document.createElement("button");
      addBtn.type = "submit";
      addBtn.textContent =
        lang === "en" ? "Add" : "追加";
      addBtn.className = "widget-button";

      form.appendChild(input);
      form.appendChild(addBtn);

      const list = document.createElement("ul");
      list.className = "todo-list";

      let items = [];

      function save() {
        try {
          localStorage.setItem(
            "standby_todo_items",
            JSON.stringify(items)
          );
        } catch (e) {}
      }

      function updateInfo() {
        const remaining = items.filter(function (it) {
          return !it.done;
        }).length;

        if (items.length === 0) {
          info.textContent =
            lang === "en"
              ? "No tasks yet"
              : "まだタスクはありません";
        } else {
          if (lang === "en") {
            info.textContent = remaining + " left";
          } else {
            info.textContent = "残り " + remaining + " 件";
          }
        }
      }

      function render() {
        list.innerHTML = "";
        items.forEach(function (item, index) {
          const li = document.createElement("li");
          li.className =
            "todo-item" + (item.done ? " done" : "");

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = item.done;

          const span = document.createElement("span");
          span.textContent = item.text;

          checkbox.addEventListener("change", function () {
            items[index].done = checkbox.checked;
            li.className =
              "todo-item" + (checkbox.checked ? " done" : "");
            save();
            updateInfo();
          });

          li.addEventListener("click", function (ev) {
            if (ev.target === checkbox) return;
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change"));
          });

          li.appendChild(checkbox);
          li.appendChild(span);
          list.appendChild(li);
        });
        updateInfo();
      }

      try {
        const saved = localStorage.getItem("standby_todo_items");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            items = parsed;
          }
        }
      } catch (e) {}
      render();

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        items.push({ text: text, done: false });
        input.value = "";
        input.focus();
        save();
        render();
      });

      wrapper.appendChild(header);
      wrapper.appendChild(form);
      wrapper.appendChild(list);
      return wrapper;
    },
  });
})();
