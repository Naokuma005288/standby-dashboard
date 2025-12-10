// src/plugins/weatherWidget.js
// 天気ウィジェット
// - 都市検索対応
// - メインカード：1時間ごとの天気 + 1週間の天気（大きめ）
// - サブカード：季節ごとの情報（春/夏/秋/冬で内容が変わる）
//   ※ Open-Meteo API をブラウザから直接叩いて使っている。

(function () {
  window.WidgetPlugins = window.WidgetPlugins || [];
  var baseLang = window.STANDBY_LANG === "en" ? "en" : "ja";

  var TEXT = {
    ja: {
      title: "天気",
      searchPlaceholder: "都市名を入力（例: 東京）",
      searchButton: "検索",
      mainCardTitle: "1時間ごとの天気・1週間の天気",
      seasonalCardTitle: "季節情報",
      now: "現在",
      feelsLike: "体感",
      updated: "更新",
      hourlyTitle: "1時間ごとの天気（次12時間）",
      dailyTitle: "1週間の予報",
      noData: "データがありません",
      today: "今日",
      tomorrow: "明日",
      seasonSpring: "春モード（花粉）",
      seasonSummer: "夏モード（暑さ指数）",
      seasonAutumn: "秋モード（紅葉コンディション）",
      seasonWinter: "冬モード（乾燥指数）",
      pollenLevel: "花粉指数",
      heatLevel: "暑さ指数",
      foliageLevel: "紅葉指数",
      dryLevel: "乾燥指数",
      levelLow: "低い",
      levelMedium: "ふつう",
      levelHigh: "高い",
      levelVeryHigh: "非常に高い",
      descSpring:
        "花粉は「風の強さ」と「空気の乾燥」で飛びやすさが変化します。",
      descSummer:
        "気温と湿度が高いと熱中症リスクが上がるので、こまめな水分補給を。",
      descAutumn:
        "昼と夜の寒暖差が大きいほど紅葉が進みやすくなります。",
      descWinter:
        "湿度が低いと肌や喉が乾燥しやすいので加湿と保湿を意識しましょう。",
      humidity: "湿度",
      wind: "風速",
      unitTemp: "℃",
      unitWind: "m/s",
      seasonNowLabel: "現在の季節",
      unknownCity: "場所が見つかりませんでした。",
    },
    en: {
      title: "Weather",
      searchPlaceholder: "Enter city (e.g. Tokyo)",
      searchButton: "Search",
      mainCardTitle: "Hourly & 7-day Forecast",
      seasonalCardTitle: "Seasonal Insights",
      now: "Now",
      feelsLike: "Feels like",
      updated: "Updated",
      hourlyTitle: "Next 12 hours",
      dailyTitle: "Next 7 days",
      noData: "No data",
      today: "Today",
      tomorrow: "Tomorrow",
      seasonSpring: "Spring mode (Pollen)",
      seasonSummer: "Summer mode (Heat index)",
      seasonAutumn: "Autumn mode (Foliage)",
      seasonWinter: "Winter mode (Dryness)",
      pollenLevel: "Pollen level",
      heatLevel: "Heat index",
      foliageLevel: "Foliage index",
      dryLevel: "Dryness index",
      levelLow: "Low",
      levelMedium: "Moderate",
      levelHigh: "High",
      levelVeryHigh: "Very high",
      descSpring:
        "Pollen level tends to increase with stronger wind and lower humidity.",
      descSummer:
        "High temperature and humidity increase heatstroke risks. Stay hydrated.",
      descAutumn:
        "Large temperature differences between day and night help foliage.",
      descWinter:
        "Low humidity can dry your skin and throat. Humidify and moisturize.",
      humidity: "Humidity",
      wind: "Wind",
      unitTemp: "°C",
      unitWind: "m/s",
      seasonNowLabel: "Season",
      unknownCity: "Location not found.",
    },
  };

  // JMA weather codesではなく Open-Meteo の weathercode に対応したざっくりテキスト＆アイコン
  var WEATHER_TEXT = {
    ja: {
      0: "快晴",
      1: "ほぼ快晴",
      2: "晴れ",
      3: "くもり",
      45: "霧",
      48: "霧",
      51: "霧雨",
      53: "霧雨",
      55: "霧雨",
      56: "凍結霧雨",
      57: "凍結霧雨",
      61: "弱い雨",
      63: "雨",
      65: "強い雨",
      71: "弱い雪",
      73: "雪",
      75: "強い雪",
      80: "にわか雨",
      81: "雨（強）",
      82: "激しい雨",
      95: "雷雨",
      96: "雷雨（ひょう）",
      99: "雷雨（ひょう）",
    },
    en: {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog",
      51: "Drizzle",
      53: "Drizzle",
      55: "Drizzle",
      56: "Freezing drizzle",
      57: "Freezing drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Rain (heavy)",
      82: "Violent rain",
      95: "Thunderstorm",
      96: "Thunderstorm (hail)",
      99: "Thunderstorm (hail)",
    },
  };

  var WEATHER_ICON = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌦️",
    55: "🌧️",
    56: "🌧️",
    57: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    71: "🌨️",
    73: "🌨️",
    75: "❄️",
    80: "🌦️",
    81: "🌧️",
    82: "⛈️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };

  var DEFAULT_CITY = {
    nameJa: "東京",
    nameEn: "Tokyo",
    latitude: 35.6812,
    longitude: 139.7671,
  };

  function getWeatherText(code, lang) {
    var table = WEATHER_TEXT[lang] || WEATHER_TEXT.ja;
    return table[code] || (lang === "en" ? "Unknown" : "不明");
  }

  function getWeatherIcon(code) {
    return WEATHER_ICON[code] || "❔";
  }

  function detectSeason(date) {
    var m = date.getMonth() + 1;
    if (m === 3 || m === 4 || m === 5) return "spring";
    if (m === 6 || m === 7 || m === 8) return "summer";
    if (m === 9 || m === 10 || m === 11) return "autumn";
    return "winter";
  }

  function formatWeekday(date, lang) {
    var ja = ["日", "月", "火", "水", "木", "金", "土"];
    var en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var idx = date.getDay();
    return lang === "en" ? en[idx] : ja[idx] + "曜";
  }

  function formatDailyLabel(date, index, lang) {
    var today = new Date();
    var d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var diff = (d - d0) / (1000 * 60 * 60 * 24);
    if (diff === 0) return lang === "en" ? TEXT.en.today : TEXT.ja.today;
    if (diff === 1) return lang === "en" ? TEXT.en.tomorrow : TEXT.ja.tomorrow;
    return formatWeekday(date, lang);
  }

  async function geocodeCity(name, lang) {
    var url =
      "https://geocoding-api.open-meteo.com/v1/search?count=1&language=" +
      encodeURIComponent(lang === "en" ? "en" : "ja") +
      "&name=" +
      encodeURIComponent(name);
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("geocoding failed");
    var json = await res.json();
    if (!json || !json.results || !json.results.length) {
      return null;
    }
    var r = json.results[0];
    return {
      latitude: r.latitude,
      longitude: r.longitude,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
    };
  }

  async function fetchForecast(lat, lon, lang) {
    var url =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      encodeURIComponent(lat) +
      "&longitude=" +
      encodeURIComponent(lon) +
      "&timezone=auto" +
      "&current_weather=true" +
      "&hourly=temperature_2m,precipitation,weathercode,relative_humidity_2m,wind_speed_10m" +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode";

    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("forecast failed");
    var json = await res.json();
    return json;
  }

  function computeSeasonalInfo(forecastJson, lang) {
    var t = TEXT[lang];
    var now = new Date();
    var season = detectSeason(now);

    var hourly = forecastJson.hourly || {};
    var daily = forecastJson.daily || {};
    var humidityArr = hourly.relative_humidity_2m || [];
    var tempHourlyArr = hourly.temperature_2m || [];
    var windHourlyArr = hourly.wind_speed_10m || [];
    var tempMaxArr = daily.temperature_2m_max || [];
    var tempMinArr = daily.temperature_2m_min || [];

    function avg(arr, n) {
      if (!arr || !arr.length) return null;
      var limit = Math.min(arr.length, n || arr.length);
      if (limit === 0) return null;
      var s = 0;
      for (var i = 0; i < limit; i++) s += arr[i];
      return s / limit;
    }

    if (season === "winter") {
      var avgHum = avg(humidityArr, 12);
      var level;
      if (avgHum == null) level = "medium";
      else if (avgHum <= 30) level = "veryHigh";
      else if (avgHum <= 40) level = "high";
      else if (avgHum <= 60) level = "medium";
      else level = "low";

      return {
        season,
        title: t.seasonWinter,
        label: t.dryLevel,
        level: levelText(level, lang),
        detail: t.descWinter,
        extra:
          t.humidity +
          ": " +
          (avgHum != null ? Math.round(avgHum) + "%" : t.noData),
      };
    }

    if (season === "summer") {
      var avgTemp = avg(tempHourlyArr, 8);
      var avgHum2 = avg(humidityArr, 8);
      var heatScore = (avgTemp || 0) * 0.6 + (avgHum2 || 0) * 0.4;
      var level2;
      if (heatScore >= 80) level2 = "veryHigh";
      else if (heatScore >= 70) level2 = "high";
      else if (heatScore >= 60) level2 = "medium";
      else level2 = "low";

      return {
        season,
        title: t.seasonSummer,
        label: t.heatLevel,
        level: levelText(level2, lang),
        detail: t.descSummer,
        extra:
          (avgTemp != null
            ? "T " + Math.round(avgTemp) + t.unitTemp
            : "") +
          (avgHum2 != null
            ? " / " + t.humidity + " " + Math.round(avgHum2) + "%"
            : ""),
      };
    }

    if (season === "autumn") {
      var dMax = tempMaxArr[0];
      var dMin = tempMinArr[0];
      var diff =
        typeof dMax === "number" && typeof dMin === "number"
          ? dMax - dMin
          : null;
      var level3;
      if (diff == null) level3 = "medium";
      else if (diff >= 12) level3 = "veryHigh";
      else if (diff >= 8) level3 = "high";
      else if (diff >= 4) level3 = "medium";
      else level3 = "low";

      return {
        season,
        title: t.seasonAutumn,
        label: t.foliageLevel,
        level: levelText(level3, lang),
        detail: t.descAutumn,
        extra:
          diff != null
            ? "昼夜の寒暖差 約" +
              Math.round(diff) +
              t.unitTemp +
              (lang === "en" ? "" : "")
            : t.noData,
      };
    }

    if (season === "spring") {
      var avgWind = avg(windHourlyArr, 8);
      var avgHum3 = avg(humidityArr, 8);
      var pollenScore = (avgWind || 0) * 1.5 + (100 - (avgHum3 || 50)) * 0.5;
      var level4;
      if (pollenScore >= 120) level4 = "veryHigh";
      else if (pollenScore >= 90) level4 = "high";
      else if (pollenScore >= 60) level4 = "medium";
      else level4 = "low";

      return {
        season,
        title: t.seasonSpring,
        label: t.pollenLevel,
        level: levelText(level4, lang),
        detail: t.descSpring,
        extra:
          t.wind +
          " " +
          (avgWind != null
            ? avgWind.toFixed(1) + " " + t.unitWind
            : t.noData),
      };
    }

    return {
      season,
      title: t.seasonWinter,
      label: t.dryLevel,
      level: levelText("medium", lang),
      detail: t.descWinter,
      extra: "",
    };
  }

  function levelText(levelKey, lang) {
    var t = TEXT[lang];
    if (levelKey === "low") return t.levelLow;
    if (levelKey === "medium") return t.levelMedium;
    if (levelKey === "high") return t.levelHigh;
    if (levelKey === "veryHigh") return t.levelVeryHigh;
    return t.levelMedium;
  }

  function createWeatherWidgetBody() {
    var lang = window.STANDBY_LANG === "en" ? "en" : "ja";
    var t = TEXT[lang];

    var root = document.createElement("div");
    root.className = "widget-inner widget-inner-weather";

    root.innerHTML = [
      '<div class="widget-section-title">',
      lang === "en" ? "Weather" : "天気",
      "</div>",
      '<div class="weather-search-row">',
      '  <input type="text" class="weather-search-input" placeholder="' +
        t.searchPlaceholder +
        '"/>',
      '  <button type="button" class="widget-button weather-search-button">' +
        t.searchButton +
        "</button>",
      "</div>",
      '<div class="weather-card-grid">',
      '  <div class="weather-card weather-card-main">',
      '    <div class="weather-main-header">',
      '      <div class="weather-main-location">',
      '        <span class="weather-main-city" data-weather-city>--</span>',
      '        <span class="weather-main-country" data-weather-country></span>',
      "      </div>",
      '      <div class="weather-main-current">',
      '        <span class="weather-main-temp" data-weather-temp-main>--°</span>',
      '        <span class="weather-main-desc" data-weather-condition-main>--</span>',
      "      </div>",
      '      <div class="weather-main-meta">',
      '        <span class="weather-main-updated" data-weather-updated></span>',
      "      </div>",
      "    </div>",
      '    <div class="weather-main-block">',
      '      <div class="weather-subtitle">' + t.hourlyTitle + "</div>",
      '      <div class="weather-hourly-strip" data-weather-hourly>',
      "      </div>",
      "    </div>",
      '    <div class="weather-main-block">',
      '      <div class="weather-subtitle">' + t.dailyTitle + "</div>",
      '      <div class="weather-daily-list" data-weather-daily>',
      "      </div>",
      "    </div>",
      "  </div>",
      '  <div class="weather-card weather-card-seasonal">',
      '    <div class="weather-seasonal-header">',
      '      <div class="weather-seasonal-title" data-weather-seasonal-title>' +
        t.seasonalCardTitle +
        "</div>",
      '      <div class="weather-seasonal-season" data-weather-season-name></div>',
      "    </div>",
      '    <div class="weather-seasonal-body">',
      '      <div class="weather-seasonal-main">',
      '        <div class="weather-seasonal-label" data-weather-seasonal-label>--</div>',
      '        <div class="weather-seasonal-level" data-weather-seasonal-level>--</div>',
      "      </div>",
      '      <div class="weather-seasonal-extra" data-weather-seasonal-extra></div>',
      '      <div class="weather-seasonal-desc" data-weather-seasonal-desc></div>',
      "    </div>",
      "  </div>",
      "</div>",
    ].join("");

    var searchInput = root.querySelector(".weather-search-input");
    var searchButton = root.querySelector(".weather-search-button");
    var cityEl = root.querySelector("[data-weather-city]");
    var countryEl = root.querySelector("[data-weather-country]");
    var tempMainEl = root.querySelector("[data-weather-temp-main]");
    var condMainEl = root.querySelector("[data-weather-condition-main]");
    var updatedEl = root.querySelector("[data-weather-updated]");
    var hourlyEl = root.querySelector("[data-weather-hourly]");
    var dailyEl = root.querySelector("[data-weather-daily]");

    var seasonalTitleEl = root.querySelector(
      "[data-weather-seasonal-title]"
    );
    var seasonalSeasonNameEl = root.querySelector(
      "[data-weather-season-name]"
    );
    var seasonalLabelEl = root.querySelector("[data-weather-seasonal-label]");
    var seasonalLevelEl = root.querySelector("[data-weather-seasonal-level]");
    var seasonalExtraEl = root.querySelector("[data-weather-seasonal-extra]");
    var seasonalDescEl = root.querySelector("[data-weather-seasonal-desc]");

    var state = {
      cityName: lang === "en" ? DEFAULT_CITY.nameEn : DEFAULT_CITY.nameJa,
      countryName: "",
      latitude: DEFAULT_CITY.latitude,
      longitude: DEFAULT_CITY.longitude,
      lastForecastJson: null,
    };

    function renderForecast(json) {
      state.lastForecastJson = json;

      var current = json.current_weather || {};
      var hourly = json.hourly || {};
      var daily = json.daily || {};

      var tempNow = current.temperature;
      var codeNow = current.weathercode;
      var timeNow = current.time;

      if (typeof tempNow === "number") {
        tempMainEl.textContent =
          Math.round(tempNow) + TEXT[lang].unitTemp;
      } else {
        tempMainEl.textContent = "--" + TEXT[lang].unitTemp;
      }
      condMainEl.textContent = getWeatherIcon(codeNow) + " " + getWeatherText(codeNow, lang);

      if (timeNow) {
        var d = new Date(timeNow);
        var hh = String(d.getHours()).padStart(2, "0");
        var mm = String(d.getMinutes()).padStart(2, "0");
        updatedEl.textContent =
          (lang === "en" ? t.updated + " " : t.updated + "：") +
          hh +
          ":" +
          mm;
      } else {
        updatedEl.textContent = "";
      }

      // 都市表示
      cityEl.textContent = state.cityName || "--";
      countryEl.textContent = state.countryName
        ? " · " + state.countryName
        : "";

      // 1時間ごとの天気（次12時間）
      hourlyEl.innerHTML = "";
      var hTimes = hourly.time || [];
      var hTemp = hourly.temperature_2m || [];
      var hCode = hourly.weathercode || [];
      if (!hTimes.length) {
        hourlyEl.textContent = t.noData;
      } else {
        var nowTime = Date.now();
        var added = 0;
        for (var i = 0; i < hTimes.length && added < 12; i++) {
          var dt = new Date(hTimes[i]);
          // 過ぎた時間も含めていいけど、「今以降」を優先
          if (dt.getTime() + 30 * 60 * 1000 < nowTime) continue;

          var hour = String(dt.getHours()).padStart(2, "0");
          var temp = hTemp[i];
          var code = hCode[i];
          var icon = getWeatherIcon(code);

          var cell = document.createElement("div");
          cell.className = "weather-hour-chip";
          cell.innerHTML = [
            '<div class="weather-hour-time">' + hour + "</div>",
            '<div class="weather-hour-icon">' + icon + "</div>",
            '<div class="weather-hour-temp">' +
              (typeof temp === "number"
                ? Math.round(temp) + TEXT[lang].unitTemp
                : "--") +
              "</div>",
          ].join("");
          hourlyEl.appendChild(cell);
          added++;
        }
        if (!added) {
          hourlyEl.textContent = t.noData;
        }
      }

      // 1週間の天気
      dailyEl.innerHTML = "";
      var dTimes = daily.time || [];
      var dMax = daily.temperature_2m_max || [];
      var dMin = daily.temperature_2m_min || [];
      var dCode = daily.weathercode || [];
      if (!dTimes.length) {
        dailyEl.textContent = t.noData;
      } else {
        var maxDays = Math.min(dTimes.length, 7);
        for (var j = 0; j < maxDays; j++) {
          var dd = new Date(dTimes[j]);
          var label = formatDailyLabel(dd, j, lang);
          var cMax = dMax[j];
          var cMin = dMin[j];
          var wc = dCode[j];
          var icon2 = getWeatherIcon(wc);

          var row = document.createElement("div");
          row.className = "weather-daily-row";
          row.innerHTML = [
            '<div class="weather-daily-day">' + label + "</div>",
            '<div class="weather-daily-icon">' + icon2 + "</div>",
            '<div class="weather-daily-temp">',
            typeof cMax === "number"
              ? Math.round(cMax) + TEXT[lang].unitTemp
              : "--",
            " / ",
            typeof cMin === "number"
              ? Math.round(cMin) + TEXT[lang].unitTemp
              : "--",
            "</div>",
          ].join("");
          dailyEl.appendChild(row);
        }
      }

      // 季節カード
      var sInfo = computeSeasonalInfo(json, lang);
      seasonalTitleEl.textContent = TEXT[lang].seasonalCardTitle;
      var seasonLabel;
      if (sInfo.season === "spring") seasonLabel = t.seasonSpring;
      else if (sInfo.season === "summer") seasonLabel = t.seasonSummer;
      else if (sInfo.season === "autumn") seasonLabel = t.seasonAutumn;
      else seasonLabel = t.seasonWinter;

      seasonalSeasonNameEl.textContent = seasonLabel;
      seasonalLabelEl.textContent = sInfo.label;
      seasonalLevelEl.textContent = sInfo.level;
      seasonalExtraEl.textContent = sInfo.extra || "";
      seasonalDescEl.textContent = sInfo.detail || "";
    }

    async function updateForecastForCurrent() {
      try {
        var json = await fetchForecast(
          state.latitude,
          state.longitude,
          lang
        );
        renderForecast(json);
      } catch (e) {
        console.error("weather fetch error", e);
        hourlyEl.textContent = t.noData;
        dailyEl.textContent = t.noData;
      }
    }

    function onSearch() {
      var q = (searchInput.value || "").trim();
      if (!q) return;
      geocodeCity(q, lang)
        .then(function (loc) {
          if (!loc) {
            alert(t.unknownCity);
            return;
          }
          state.latitude = loc.latitude;
          state.longitude = loc.longitude;
          state.cityName = loc.name;
          var countryName = loc.country || "";
          var admin1 = loc.admin1 || "";
          if (lang === "ja") {
            state.countryName = admin1 || countryName;
          } else {
            state.countryName = countryName || admin1;
          }
          return updateForecastForCurrent();
        })
        .catch(function (e) {
          console.error("geocode error", e);
          alert(t.unknownCity);
        });
    }

    searchButton.addEventListener("click", onSearch);
    searchInput.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        onSearch();
      }
    });

    // 初期表示（東京）
    updateForecastForCurrent();

    return root;
  }

  window.WidgetPlugins.push({
    id: "weather",
    name: baseLang === "en" ? "Weather" : "天気",
    createBodyElement: createWeatherWidgetBody,
  });
})();
