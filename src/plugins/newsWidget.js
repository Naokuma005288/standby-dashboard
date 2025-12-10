// src/plugins/newsWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  const newsData = {
    ja: [
      {
        title: "勉強の集中力を上げる3つのコツ",
        tag: "Study",
        time: "今日",
      },
      {
        title: "睡眠時間がテストの点数に与える影響",
        tag: "Life",
        time: "1時間前",
      },
      {
        title: "新しいノートアプリで課題管理が楽に",
        tag: "Apps",
        time: "さっき",
      },
      {
        title: "短時間でもできるストレッチ習慣",
        tag: "Health",
        time: "昨日",
      },
      {
        title: "好きな音楽でモチベを上げる方法",
        tag: "Music",
        time: "2日前",
      },
    ],
    en: [
      {
        title: "3 tips to boost your study focus",
        tag: "Study",
        time: "Today",
      },
      {
        title: "How sleep length affects your test scores",
        tag: "Life",
        time: "1h ago",
      },
      {
        title: "New note app makes homework tracking easier",
        tag: "Apps",
        time: "Just now",
      },
      {
        title: "Quick stretch routine for busy days",
        tag: "Health",
        time: "Yesterday",
      },
      {
        title: "Using your favorite music to stay motivated",
        tag: "Music",
        time: "2 days ago",
      },
    ],
  };

  function getNews(lang) {
    const list = newsData[lang] || newsData.ja;
    return list.slice();
  }

  window.WidgetPlugins.push({
    id: "news",
    name: baseLang === "en" ? "News" : "ニュース",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-news";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "6px";

      const title = document.createElement("div");
      title.className = "widget-section-title";
      title.textContent = lang === "en" ? "News" : "ニュース";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "widget-button";
      btn.textContent = lang === "en" ? "Refresh" : "更新";

      header.appendChild(title);
      header.appendChild(btn);

      const listEl = document.createElement("ul");
      listEl.className = "news-list";

      const allNews = getNews(lang);
      let offset = 0;

      function render() {
        listEl.innerHTML = "";
        if (!allNews.length) return;

        const count = Math.min(3, allNews.length);
        for (let i = 0; i < count; i++) {
          const item = allNews[(offset + i) % allNews.length];
          const li = document.createElement("li");
          li.className = "news-item";

          const t = document.createElement("div");
          t.className = "news-item-title";
          t.textContent = item.title;

          const meta = document.createElement("div");
          meta.className = "news-item-meta";
          meta.textContent = item.tag + " · " + item.time;

          li.appendChild(t);
          li.appendChild(meta);
          listEl.appendChild(li);
        }
      }

      // 手動更新
      btn.addEventListener("click", function () {
        if (!allNews.length) return;
        offset = (offset + 1) % allNews.length;
        render();
      });

      render();

      // ⏱ 自動でゆっくりローテーション（8秒ごと）
      if (allNews.length > 1) {
        setInterval(function () {
          offset = (offset + 1) % allNews.length;
          render();
        }, 8000);
      }

      wrapper.appendChild(header);
      wrapper.appendChild(listEl);
      return wrapper;
    },
  });
})();
