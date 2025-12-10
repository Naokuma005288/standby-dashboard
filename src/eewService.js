// src/eewService.js
// P2P地震情報 JSON API v2 から緊急地震速報（警報: code 556）を定期取得するサービス。
// ※これはあくまで「個人用の実験・可視化」用。公式の緊急地震速報の代わりにはならない。

(function () {
  /**
   * @typedef {Object} EEWAlert
   * @property {number} code
   * @property {boolean} cancelled
   * @property {string} issueTime
   * @property {string | null} issueId
   * @property {number | null} serial
   * @property {number | null} maxScale
   * @property {string | number | null} magnitude
   * @property {string | number | null} depth
   * @property {string} locationName
   * @property {number | null} latitude
   * @property {number | null} longitude
   */

  /**
   * @param {object} options
   * @param {number} [options.pollIntervalMs]
   * @param {(alert: EEWAlert | null) => void} options.onUpdate
   * @param {(alert: EEWAlert) => void} [options.onNewAlert]
   */
  function EEWService(options) {
    this.pollIntervalMs = options.pollIntervalMs || 10000; // 10秒ごと
    this.onUpdate = options.onUpdate;
    this.onNewAlert = options.onNewAlert || null;

    /** @type {string | null} */
    this.lastIssueId = null;
    this.timerId = null;
  }

  EEWService.prototype.start = function () {
    if (this.timerId) return;
    this._fetchOnce();
    var self = this;
    this.timerId = setInterval(function () {
      self._fetchOnce();
    }, this.pollIntervalMs);
  };

  EEWService.prototype.stop = function () {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  };

  EEWService.prototype._fetchOnce = async function () {
    try {
      var url = "https://api.p2pquake.net/v2/history?codes=556&limit=1";
      var res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.warn("EEWService: HTTP error", res.status);
        return;
      }

      var data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        if (typeof this.onUpdate === "function") {
          this.onUpdate(null);
        }
        return;
      }

      var raw = data[0];
      var alert = this._normalize(raw);

      // 最新状態の更新
      if (typeof this.onUpdate === "function") {
        this.onUpdate(alert);
      }

      // 新しい警報かどうか
      if (alert.issueId && alert.issueId !== this.lastIssueId) {
        if (this.lastIssueId !== null && typeof this.onNewAlert === "function") {
          this.onNewAlert(alert);
        }
        this.lastIssueId = alert.issueId;
      } else if (!this.lastIssueId && alert.issueId) {
        // 最初の1回目は「過去分」扱いでアラートは鳴らさない
        this.lastIssueId = alert.issueId;
      }
    } catch (err) {
      console.error("EEWService: fetch error", err);
    }
  };

  EEWService.prototype._normalize = function (raw) {
    var issue = raw.issue || {};
    var eq = raw.earthquake || {};
    var hypo = eq.hypocenter || {};

    var issueId =
      issue.id ||
      issue.eventId ||
      raw.id ||
      (raw._id && raw._id.$oid) ||
      null;

    return {
      code: raw.code,
      cancelled: !!raw.cancelled,
      issueTime: issue.time || raw.time || "",
      issueId: issueId,
      serial: typeof issue.serial === "number" ? issue.serial : null,
      maxScale: typeof eq.maxScale === "number" ? eq.maxScale : null,
      magnitude:
        hypo.magnitude != null
          ? hypo.magnitude
          : eq.magnitude != null
          ? eq.magnitude
          : null,
      depth: hypo.depth != null ? hypo.depth : null,
      locationName:
        hypo.name ||
        hypo.reduceName ||
        eq.hypocenterName ||
        (eq.name || ""),
      latitude:
        typeof hypo.latitude === "number" ? hypo.latitude : null,
      longitude:
        typeof hypo.longitude === "number" ? hypo.longitude : null,
    };
  };

  window.EEWService = EEWService;
})();
