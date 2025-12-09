// src/plugins/memoWidget.js

window.WidgetPlugins = window.WidgetPlugins || [];

window.WidgetPlugins.push({
  id: "memo",
  name: "メモ",

  createBodyElement() {
    const wrapper = document.createElement("div");
    const textarea = document.createElement("textarea");
    textarea.placeholder = "メモを書く…";
    wrapper.appendChild(textarea);
    return wrapper;
  },
});
