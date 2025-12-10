// src/plugins/helloWidget.js

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  const baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  window.WidgetPlugins.push({
    id: "hello",
    name: baseLang === "en" ? "Today's Note" : "今日のひとこと",

    createBodyElement() {
      const lang = window.STANDBY_LANG === "en" ? "en" : "ja";

      const wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-hello";

      const titleRow = document.createElement("div");
      titleRow.style.display = "flex";
      titleRow.style.justifyContent = "space-between";
      titleRow.style.alignItems = "center";
      titleRow.style.marginBottom = "6px";

      const title = document.createElement("div");
      title.textContent =
        lang === "en" ? "Today's Note" : "今日のひとこと";
      title.className = "widget-section-title";

      const moodBadge = document.createElement("div");
      moodBadge.style.fontSize = "11px";
      moodBadge.style.opacity = "0.8";

      titleRow.appendChild(title);
      titleRow.appendChild(moodBadge);

      const main = document.createElement("p");
      main.className = "hello-main-text hello-animate";

      const subWrapper = document.createElement("div");
      subWrapper.className = "hello-sub-text";

      const tagRow = document.createElement("div");
      tagRow.className = "hello-tag-row";

      const now = new Date();
      const hour = now.getHours();
      const weekday = now.getDay(); // 0:日

      let moodLabel = "";
      let mainText = "";
      let subText = "";
      let tags = [];

      if (lang === "ja") {
        if (hour < 5) {
          moodLabel = "Night mode 🌙";
          mainText = "夜更かししすぎ注意…！";
          subText =
            "明日の自分をちょっとだけ大事にしてあげて。そろそろ寝る準備でも。";
          tags = ["休息", "睡眠", "クールダウン"];
        } else if (hour < 11) {
          moodLabel = "Morning ☀️";
          mainText = "おはよう、今日のスタートはどう？";
          subText =
            "朝イチで小さいタスクを1つ片付けると、その日ずっと楽になるよ。";
          tags = ["朝活", "リセット", "軽めタスク"];
        } else if (hour < 18) {
          moodLabel = "Daytime 📚";
          mainText = "午後もマイペースでいこ。";
          subText =
            "集中 → 休憩 → 集中 のリズムを意識すると、意外と長くがんばれる。";
          tags = ["集中", "ポモドーロ", "水分補給"];
        } else {
          moodLabel = "Evening 🌆";
          mainText = "今日もおつかれさま。";
          subText =
            "「できなかったこと」より、「ちょっとでもできたこと」を1つだけ思い出してみよ。";
          tags = ["振り返り", "クールダウン", "ゆっくりタイム"];
        }
      } else {
        if (hour < 5) {
          moodLabel = "Night mode 🌙";
          mainText = "Careful not to stay up too late.";
          subText =
            "Tomorrow-you will be happier if you start winding down soon.";
          tags = ["rest", "sleep", "cool-down"];
        } else if (hour < 11) {
          moodLabel = "Morning ☀️";
          mainText = "Good morning, how's your start?";
          subText =
            "Finishing one tiny task in the morning can make the whole day easier.";
          tags = ["morning", "reset", "small tasks"];
        } else if (hour < 18) {
          moodLabel = "Daytime 📚";
          mainText = "Take the afternoon at your own pace.";
          subText =
            "Focus → break → focus. That rhythm keeps your brain alive longer.";
          tags = ["focus", "pomodoro", "hydrate"];
        } else {
          moodLabel = "Evening 🌆";
          mainText = "Nice work today.";
          subText =
            "Instead of what you couldn't do, recall just one thing you did well.";
          tags = ["reflection", "cool-down", "slow time"];
        }
      }

      const weekdayHintsJa = {
        0: "日曜日。明日の自分がちょっと楽になる一手だけ打っておこ。",
        1: "月曜日スタート。全部完璧にやろうとしなくてOK。",
        2: "火曜日。まだまだ一週間は長いので、ペース配分大事。",
        3: "水曜日。折り返し地点。小さなごほうび入れとこ。",
        4: "木曜日。そろそろ週末のことをチラ見しながら、もう一踏ん張り。",
        5: "金曜日。ラストスパートというより、きれいに着地するイメージで。",
        6: "土曜日。やること決めてから、あとは思いっきりダラダラするのもアリ。",
      };

      const weekdayHintsEn = {
        0: "Sunday. One small move for tomorrow-you is enough.",
        1: "Monday. No need to be perfect from day one.",
        2: "Tuesday. Still a long week, pace yourself.",
        3: "Wednesday. Halfway there. Tiny reward time.",
        4: "Thursday. Weekend is visible. One more push.",
        5: "Friday. Aim for a clean landing, not overwork.",
        6: "Saturday. Decide what to do, then relax guilt-free.",
      };

      const weekdayHint =
        lang === "ja"
          ? weekdayHintsJa[weekday]
          : weekdayHintsEn[weekday];

      main.textContent = mainText;

      const subTextMain = document.createElement("div");
      subTextMain.textContent = subText;
      subWrapper.appendChild(subTextMain);

      if (weekdayHint) {
        const subExtra = document.createElement("div");
        subExtra.style.fontSize = "11px";
        subExtra.style.opacity = "0.78";
        subExtra.style.marginTop = "6px";
        subExtra.textContent = weekdayHint;
        subWrapper.appendChild(subExtra);
      }

      moodBadge.textContent = moodLabel;

      tags.forEach((t) => {
        const chip = document.createElement("span");
        chip.className = "hello-chip";
        chip.textContent = "#" + t;
        tagRow.appendChild(chip);
      });

      wrapper.appendChild(titleRow);
      wrapper.appendChild(main);
      wrapper.appendChild(subWrapper);
      wrapper.appendChild(tagRow);
      return wrapper;
    },
  });
})();
