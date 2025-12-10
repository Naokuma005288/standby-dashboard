// src/plugins/calendarWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  const weekdayLabels = {
    ja: ["日", "月", "火", "水", "木", "金", "土"],
    en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  };

  const monthNamesEn = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  window.WidgetPlugins.push({
    id: "calendar",
    name: baseLang === "en" ? "Mini Calendar" : "ミニカレンダー",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-calendar";

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "4px";
      header.style.fontSize = "13px";

      const title = document.createElement("span");
      title.className = "widget-section-title";
      title.style.fontSize = "15px";
      title.style.marginBottom = "0";
      if (lang === "ja") {
        title.textContent =
          year + "年" + (month + 1) + "月";
      } else {
        title.textContent =
          monthNamesEn[month] + " " + year;
      }

      const todaySpan = document.createElement("span");
      todaySpan.style.fontSize = "11px";
      todaySpan.style.opacity = "0.75";
      todaySpan.textContent =
        lang === "en"
          ? "Today: " + today
          : "今日: " + today + "日";

      header.appendChild(title);
      header.appendChild(todaySpan);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontSize = "11px";
      table.style.tableLayout = "fixed";
      table.style.marginTop = "4px";

      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");

      weekdayLabels[lang].forEach(function (w, i) {
        const th = document.createElement("th");
        th.textContent = w;
        th.style.padding = "2px 0";
        th.style.opacity = "0.7";
        th.style.fontWeight = "500";
        if (i === 0) th.style.color = "#fecaca";
        if (i === 6) th.style.color = "#bfdbfe";
        headRow.appendChild(th);
      });

      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(
        year,
        month + 1,
        0
      ).getDate();

      let currentDay = 1;
      let row = document.createElement("tr");

      for (let i = 0; i < firstDay; i++) {
        const td = document.createElement("td");
        td.textContent = "";
        td.style.padding = "2px 0";
        row.appendChild(td);
      }

      while (currentDay <= daysInMonth) {
        if (row.children.length === 7) {
          tbody.appendChild(row);
          row = document.createElement("tr");
        }

        const td = document.createElement("td");
        td.textContent = String(currentDay);
        td.style.padding = "2px 0";
        td.style.textAlign = "center";

        if (currentDay === today) {
          td.style.borderRadius = "999px";
          td.style.background = "rgba(255, 255, 255, 0.18)";
          td.style.fontWeight = "600";
        }

        row.appendChild(td);
        currentDay++;
      }

      if (row.children.length > 0) {
        while (row.children.length < 7) {
          const td = document.createElement("td");
          td.textContent = "";
          td.style.padding = "2px 0";
          row.appendChild(td);
        }
        tbody.appendChild(row);
      }

      table.appendChild(tbody);
      wrapper.appendChild(header);
      wrapper.appendChild(table);

      return wrapper;
    },
  });
})();
