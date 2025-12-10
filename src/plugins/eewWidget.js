// src/plugins/eewWidget.js
// 緊急地震速報ウィジェット（P2P地震情報）
// ・code=556: 緊急地震速報（警報） → 右側ウィジェット＋画面全体の赤オーバーレイ
// ・code=551: 地震情報（通常の地震）→ 画面右上に小さいトースト通知
// ※これは「個人開発用の実験表示」。安全の判断は必ず公式の緊急速報・テレビ・ラジオを優先すること。

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];

  var baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  var TEXT = {
    ja: {
      title: "緊急地震速報",
      badge: "P2P地震情報",
      noAlert: "現在、発表されている緊急地震速報（警報）はありません。",
      hasAlert: "緊急地震速報（警報）が発表されています。",
      cancelled: "この緊急地震速報は取り消されました。",
      unknown: "不明",
      unknownLocation: "震源不明",
      unknownTime: "時刻不明",
      depthUnit: "km",
      note:
        "※これは個人開発用の実験的な表示です。身の安全は公式の情報を必ず優先してください。",
      overlayTitle: "緊急地震速報（警報）",
      overlayBadge: "実験表示",
      overlayNote:
        "公式の緊急速報メール・テレビ・ラジオの情報を必ず優先してください。",
      intensityLabel: "最大予想震度",
      toastTitle: "地震情報",
    },
    en: {
      title: "Earthquake Early Warning",
      badge: "P2P Quake (JP)",
      noAlert: "No EEW warning is currently issued.",
      hasAlert: "Earthquake Early Warning (warning) is in effect.",
      cancelled: "This EEW warning has been cancelled.",
      unknown: "Unknown",
      unknownLocation: "Epicenter unknown",
      unknownTime: "Unknown time",
      depthUnit: "km",
      note:
        "This is an experimental personal indicator. Always follow official alerts first.",
      overlayTitle: "Earthquake Early Warning",
      overlayBadge: "EXPERIMENT",
      overlayNote:
        "Always follow official alerts on your phone / TV / radio first.",
      intensityLabel: "Max expected intensity",
      toastTitle: "Earthquake",
    },
  };

  var INTENSITY_MAP = {
    ja: {
      "-1": "不明",
      10: "震度1",
      20: "震度2",
      30: "震度3",
      40: "震度4",
      50: "震度5弱",
      55: "震度5強",
      60: "震度6弱",
      65: "震度6強",
      70: "震度7",
    },
    en: {
      "-1": "Unknown",
      10: "JMA 1",
      20: "JMA 2",
      30: "JMA 3",
      40: "JMA 4",
      50: "JMA 5-",
      55: "JMA 5+",
      60: "JMA 6-",
      65: "JMA 6+",
      70: "JMA 7",
    },
  };

  function formatScale(scale, lang) {
    if (scale == null) {
      return TEXT[lang].unknown;
    }
    var map = INTENSITY_MAP[lang] || INTENSITY_MAP.ja;
    var key = String(scale);
    return map[key] || (lang === "en" ? "JMA " + scale : "震度?(" + scale + ")");
  }

  function formatIssueTime(str, lang) {
    if (!str || typeof str !== "string") {
      return TEXT[lang].unknownTime;
    }
    var d = new Date(str);
    if (isNaN(d.getTime())) {
      return str;
    }
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    if (lang === "en") {
      return (
        y +
        "-" +
        String(m).padStart(2, "0") +
        "-" +
        String(day).padStart(2, "0") +
        " " +
        hh +
        ":" +
        mm
      );
    } else {
      return y + "年" + m + "月" + day + "日 " + hh + ":" + mm;
    }
  }

  function formatShortTime(str, lang) {
    if (!str || typeof str !== "string") {
      return TEXT[lang].unknownTime;
    }
    var d = new Date(str);
    if (isNaN(d.getTime())) {
      return str;
    }
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    if (lang === "en") {
      return hh + ":" + mm;
    } else {
      return hh + ":" + mm + "頃";
    }
  }

  function createOverlay(lang) {
    var t = TEXT[lang];
    var overlay = document.createElement("div");
    overlay.className = "eew-alert-overlay";

    overlay.innerHTML = [
      '<div class="eew-alert-card">',
      '  <div class="eew-alert-header">',
      '    <span class="eew-alert-label">' + t.overlayTitle + "</span>",
      '    <span class="eew-alert-chip">' + t.overlayBadge + "</span>",
      "  </div>",
      '  <div class="eew-alert-main">',
      '    <div class="eew-alert-intensity" data-eew-overlay-maxScale>--</div>',
      '    <div class="eew-alert-sub">',
      '      <span data-eew-overlay-location>---</span>',
      '      <span class="dot">・</span>',
      '      <span data-eew-overlay-mag>M -</span>',
      '      <span class="dot">・</span>',
      '      <span data-eew-overlay-depth>- ' + t.depthUnit + "</span>",
      "    </div>",
      '    <div class="eew-alert-time" data-eew-overlay-time>----</div>',
      '    <div class="eew-alert-note">' + t.overlayNote + "</div>",
      "  </div>",
      "</div>",
    ].join("");

    document.body.appendChild(overlay);

    function q(sel) {
      return overlay.querySelector(sel);
    }

    function show(alert) {
      q("[data-eew-overlay-maxScale]").textContent = formatScale(
        alert.maxScale,
        lang
      );
      q("[data-eew-overlay-location]").textContent =
        alert.locationName || TEXT[lang].unknownLocation;
      q("[data-eew-overlay-mag]").textContent =
        alert.magnitude != null
          ? "M " + alert.magnitude
          : "M " + TEXT[lang].unknown;
      q("[data-eew-overlay-depth]").textContent =
        alert.depth != null
          ? alert.depth + " " + TEXT[lang].depthUnit
          : "- " + TEXT[lang].depthUnit;
      q("[data-eew-overlay-time]").textContent = formatIssueTime(
        alert.issueTime,
        lang
      );

      overlay.classList.add("is-visible");
      clearTimeout(show._timerId);
      show._timerId = setTimeout(function () {
        overlay.classList.remove("is-visible");
      }, 15000);
    }

    return { root: overlay, show: show };
  }

  // グローバルに1個だけ使うトーストとポーリングフラグ
  var globalQuakeToast = null;
  var quakePollFlagKey = "__standby_quake_poll_started__";

  function createQuakeToast(lang) {
    if (globalQuakeToast) return globalQuakeToast;

    var t = TEXT[lang];

    var container = document.createElement("div");
    container.className = "quake-toast-container";

    var toast = document.createElement("div");
    toast.className = "quake-toast";

    toast.innerHTML = [
      '<div class="quake-toast-main">',
      '  <div class="quake-toast-main-left">',
      '    <span class="quake-toast-title">' + t.toastTitle + "</span>",
      '    <span class="quake-toast-intensity" data-quake-intensity>--</span>',
      "  </div>",
      '  <span class="quake-toast-location" data-quake-location>---</span>',
      "</div>",
      '<div class="quake-toast-meta" data-quake-meta></div>',
    ].join("");

    container.appendChild(toast);
    document.body.appendChild(container);

    var intensityEl = toast.querySelector("[data-quake-intensity]");
    var locationEl = toast.querySelector("[data-quake-location]");
    var metaEl = toast.querySelector("[data-quake-meta]");

    var hideTimer = null;

    function hide() {
      if (!toast.classList.contains("is-visible")) return;
      toast.classList.remove("is-visible");
      toast.classList.add("is-hiding");
      setTimeout(function () {
        toast.classList.remove("is-hiding");
      }, 400);
    }

    function show(quake) {
      var intensityText = formatScale(quake.maxScale, lang);
      var loc =
        quake.locationName && quake.locationName.length
          ? quake.locationName
          : TEXT[lang].unknownLocation;
      var magText =
        quake.magnitude != null ? "M " + quake.magnitude : TEXT[lang].unknown;
      var depthText =
        quake.depth != null
          ? (lang === "en"
              ? quake.depth + " " + TEXT[lang].depthUnit
              : quake.depth + TEXT[lang].depthUnit)
          : TEXT[lang].unknown;
      var timeText = formatShortTime(quake.time, lang);

      intensityEl.textContent = intensityText;
      locationEl.textContent = loc;

      if (lang === "en") {
        metaEl.textContent =
          magText + " / Depth " + depthText + " / " + timeText + " JST";
      } else {
        metaEl.textContent =
          magText + " / 深さ " + depthText + " / " + timeText;
      }

      toast.classList.remove("is-hiding");
      toast.classList.add("is-visible");

      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 8000);
    }

    toast.addEventListener("click", hide);

    globalQuakeToast = { show: show };
    return globalQuakeToast;
  }

  function ensureQuakePoll(lang) {
    if (window[quakePollFlagKey]) return;
    window[quakePollFlagKey] = true;

    var toast = createQuakeToast(lang);
    var lastQuakeId = null;

    async function pollOnce() {
      try {
        var url = "https://api.p2pquake.net/v2/history?codes=551&limit=1";
        var res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          return;
        }
        var data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          return;
        }
        var raw = data[0];
        var id =
          raw.id ||
          (raw._id && raw._id.$oid) ||
          (raw.earthquake && raw.earthquake.time) ||
          raw.time ||
          null;

        if (!id) return;

        if (lastQuakeId === null) {
          // 初回は「過去分」なので通知出さない
          lastQuakeId = id;
          return;
        }
        if (id === lastQuakeId) return;
        lastQuakeId = id;

        var eq = raw.earthquake || {};
        var hypo = eq.hypocenter || {};

        var quake = {
          maxScale:
            typeof eq.maxScale === "number" ? eq.maxScale : null,
          locationName:
            hypo.name ||
            hypo.reduceName ||
            eq.hypocenterName ||
            "" ||
            TEXT[lang].unknownLocation,
          magnitude:
            hypo.magnitude != null
              ? hypo.magnitude
              : eq.magnitude != null
              ? eq.magnitude
              : null,
          depth: hypo.depth != null ? hypo.depth : null,
          time: eq.time || raw.time || "",
        };

        toast.show(quake);
      } catch (e) {
        console.error("Quake toast poll error", e);
      }
    }

    pollOnce();
    setInterval(pollOnce, 15000); // 15秒ごとに通常地震情報チェック
  }

  window.WidgetPlugins.push({
    id: "eew",
    name: baseLang === "en" ? "EEW" : "緊急地震速報",

    createBodyElement: function () {
      var lang = window.STANDBY_LANG === "en" ? "en" : "ja";
      var t = TEXT[lang];

      var wrapper = document.createElement("div");
      wrapper.className = "widget-inner widget-inner-eew";

      var inner = document.createElement("div");
      inner.className = "eew-widget-inner";

      inner.innerHTML = [
        '<div class="eew-widget-header">',
        '  <div class="eew-widget-title">',
        '    <span class="icon">⚠️</span>',
        "    <span>" + t.title + "</span>",
        "  </div>",
        '  <div class="eew-widget-badge">' + t.badge + "</div>",
        "</div>",
        '<div class="eew-widget-status" data-eew-status>',
        t.noAlert,
        "</div>",
        '<div class="eew-widget-body">',
        '  <div class="eew-main-intensity">',
        '    <div class="label">' + t.intensityLabel + "</div>",
        '    <div class="value" data-eew-maxScale>--</div>',
        "  </div>",
        '  <div class="eew-detail-grid">',
        '    <div class="item">',
        '      <div class="label">' +
          (lang === "en" ? "Epicenter" : "震源") +
          "</div>",
        '      <div class="value" data-eew-location>---</div>',
        "    </div>",
        '    <div class="item">',
        '      <div class="label">' +
          (lang === "en" ? "Magnitude" : "マグニチュード") +
          "</div>",
        '      <div class="value" data-eew-mag>--</div>',
        "    </div>",
        '    <div class="item">',
        '      <div class="label">' +
          (lang === "en" ? "Depth" : "深さ") +
          "</div>",
        '      <div class="value" data-eew-depth>--</div>',
        "    </div>",
        "  </div>",
        '  <div class="eew-time-row">',
        '    <span class="label">' +
          (lang === "en" ? "Issued at" : "発表時刻") +
          "</span>",
        '    <span class="value" data-eew-time>--</span>',
        "  </div>",
        '  <div class="eew-note">' + t.note + "</div>",
        "</div>",
      ].join("");

      wrapper.appendChild(inner);

      function q(sel) {
        return inner.querySelector(sel);
      }

      var statusEl = q("[data-eew-status]");
      var maxScaleEl = q("[data-eew-maxScale]");
      var locEl = q("[data-eew-location]");
      var magEl = q("[data-eew-mag]");
      var depthEl = q("[data-eew-depth]");
      var timeEl = q("[data-eew-time]");

      var overlay = createOverlay(lang);

      if (!window.EEWService) {
        statusEl.textContent =
          "EEWService が読み込まれていません。スクリプトの順番を確認してください。";
        return wrapper;
      }

      var service = new window.EEWService({
        pollIntervalMs: 10000,
        onUpdate: function (alert) {
          if (!alert) {
            inner.classList.remove("has-alert");
            statusEl.textContent = t.noAlert;
            maxScaleEl.textContent = "--";
            locEl.textContent = "---";
            magEl.textContent = "--";
            depthEl.textContent = "--";
            timeEl.textContent = "--";
            return;
          }

          if (alert.cancelled) {
            inner.classList.remove("has-alert");
            statusEl.textContent = t.cancelled;
          } else {
            inner.classList.add("has-alert");
            statusEl.textContent = t.hasAlert;
          }

          maxScaleEl.textContent = formatScale(alert.maxScale, lang);
          locEl.textContent = alert.locationName || t.unknownLocation;
          magEl.textContent =
            alert.magnitude != null ? "M " + alert.magnitude : t.unknown;
          depthEl.textContent =
            alert.depth != null
              ? alert.depth + " " + t.depthUnit
              : t.unknown;
          timeEl.textContent = formatIssueTime(alert.issueTime, lang);
        },
        onNewAlert: function (alert) {
          overlay.show(alert);
          // 警報も小さいトーストに軽く出しておく
          var toast = createQuakeToast(lang);
          toast.show({
            maxScale: alert.maxScale,
            locationName: alert.locationName,
            magnitude: alert.magnitude,
            depth: alert.depth,
            time: alert.issueTime,
          });
        },
      });

      service.start();

      // 通常の地震情報(551)のトースト通知も開始
      ensureQuakePoll(lang);

      wrapper._eewService = service;
      return wrapper;
    },
  });
})();
