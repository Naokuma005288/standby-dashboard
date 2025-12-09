// src/plugins/memoWidget.js

export const memoWidgetPlugin = {
  id: "memo",
  name: "メモ",

  createBodyElement() {
    const wrapper = document.createElement("div");

    const textarea = document.createElement("textarea");
    textarea.placeholder = "メモを書く…";

    wrapper.appendChild(textarea);
    return wrapper;
  },
};
