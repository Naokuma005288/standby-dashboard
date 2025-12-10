// src/player.js

(function () {
  function setupPlayer() {
    var media = document.getElementById("playerMedia");
    var filenameEl = document.getElementById("playerFilename");
    var addBtn = document.getElementById("playerAddBtn");
    var fileInput = document.getElementById("playerFileInput");
    var prevBtn = document.getElementById("playerPrevBtn");
    var nextBtn = document.getElementById("playerNextBtn");
    var playBtn = document.getElementById("playerPlayPauseBtn");
    var seek = document.getElementById("playerSeek");
    var currentTimeEl = document.getElementById("playerCurrentTime");
    var durationEl = document.getElementById("playerDuration");
    var thumbWrapper = document.getElementById("playerThumbWrapper");

    if (
      !media ||
      !filenameEl ||
      !addBtn ||
      !fileInput ||
      !prevBtn ||
      !nextBtn ||
      !playBtn ||
      !seek ||
      !currentTimeEl ||
      !durationEl ||
      !thumbWrapper
    ) {
      return;
    }

    // 🔊 念のためミュート解除＆音量MAX
    try {
      media.muted = false;
      media.volume = 1.0;
    } catch (e) {}

    var lang = window.STANDBY_LANG === "en" ? "en" : "ja";

    var TEXT = {
      ja: {
        empty: "ファイルなし",
        hint: "＋ から追加",
      },
      en: {
        empty: "No file",
        hint: "Tap ＋ to add",
      },
    };

    function getText(key) {
      var set = TEXT[lang] || TEXT.ja;
      return set[key];
    }

    var playlist = []; // { file: File }
    var currentIndex = -1;
    var currentUrl = null;
    var seeking = false;
    var isPlaying = false;

    function isVideoFile(file) {
      return file && file.type && file.type.indexOf("video") === 0;
    }

    function updatePlayButton() {
      playBtn.textContent = isPlaying ? "⏸" : "▶";
    }

    function updateFilename() {
      if (!playlist.length || currentIndex < 0 || !playlist[currentIndex]) {
        filenameEl.textContent =
          getText("empty") + " · " + getText("hint");
        return;
      }
      var file = playlist[currentIndex].file;
      filenameEl.textContent =
        (currentIndex + 1) +
        "/" +
        playlist.length +
        " · " +
        file.name;
    }

    function updateThumbVisibility() {
      if (!playlist.length || currentIndex < 0 || !playlist[currentIndex]) {
        thumbWrapper.classList.remove("is-video");
        return;
      }
      var file = playlist[currentIndex].file;
      if (isVideoFile(file)) {
        thumbWrapper.classList.add("is-video");
      } else {
        thumbWrapper.classList.remove("is-video");
      }
    }

    function formatTime(seconds) {
      if (!isFinite(seconds) || seconds < 0) seconds = 0;
      var s = Math.floor(seconds);
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      var r = s % 60;
      if (h > 0) {
        return (
          h +
          ":" +
          String(m).padStart(2, "0") +
          ":" +
          String(r).padStart(2, "0")
        );
      } else {
        return m + ":" + String(r).padStart(2, "0");
      }
    }

    function updateTimeUI() {
      var dur = media.duration || 0;
      var cur = media.currentTime || 0;

      durationEl.textContent = formatTime(dur);
      currentTimeEl.textContent = formatTime(cur);

      if (!seeking) {
        if (dur > 0) {
          seek.value = String(Math.floor((cur / dur) * 1000));
        } else {
          seek.value = "0";
        }
      }
    }

    function attachMediaEvents() {
      media.addEventListener("timeupdate", updateTimeUI);
      media.addEventListener("loadedmetadata", updateTimeUI);
      media.addEventListener("ended", function () {
        goNext(true);
      });
    }

    function detachMediaEvents() {
      media.removeEventListener("timeupdate", updateTimeUI);
      media.removeEventListener("loadedmetadata", updateTimeUI);
    }

    function loadTrack(index, autoPlay) {
      if (!playlist.length) return;
      if (index < 0 || index >= playlist.length) return;

      var item = playlist[index];
      if (!item || !item.file) return;

      if (currentUrl) {
        try {
          URL.revokeObjectURL(currentUrl);
        } catch (e) {}
        currentUrl = null;
      }

      currentIndex = index;
      var url = URL.createObjectURL(item.file);
      currentUrl = url;

      detachMediaEvents();
      media.src = url;
      media.load();
      attachMediaEvents();

      // 念のためまたミュート解除
      try {
        media.muted = false;
        media.volume = 1.0;
      } catch (e) {}

      updateThumbVisibility();
      updateFilename();
      updateTimeUI();

      if (autoPlay) {
        playInternal();
      } else {
        isPlaying = false;
        updatePlayButton();
      }
    }

    function playInternal() {
      if (!playlist.length) return;
      if (currentIndex < 0) {
        loadTrack(0, true);
        return;
      }
      try {
        media.muted = false;
        media.volume = 1.0;
      } catch (e) {}
      media
        .play()
        .then(function () {
          isPlaying = true;
          updatePlayButton();
        })
        .catch(function () {
          isPlaying = false;
          updatePlayButton();
        });
    }

    function pauseInternal() {
      media.pause();
      isPlaying = false;
      updatePlayButton();
    }

    function togglePlay() {
      if (!playlist.length) return;
      if (currentIndex < 0) {
        loadTrack(0, true);
        return;
      }
      if (media.paused || media.ended) {
        playInternal();
      } else {
        pauseInternal();
      }
    }

    function goNext(autoPlay) {
      if (!playlist.length) return;
      if (currentIndex < 0) {
        loadTrack(0, autoPlay);
        return;
      }
      var nextIndex = (currentIndex + 1) % playlist.length;
      loadTrack(nextIndex, autoPlay);
    }

    function goPrev(autoPlay) {
      if (!playlist.length) return;
      if (currentIndex < 0) {
        loadTrack(0, autoPlay);
        return;
      }
      var prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      loadTrack(prevIndex, autoPlay);
    }

    // 🔁 ファイル選択
    addBtn.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function () {
      if (!fileInput.files || !fileInput.files.length) return;

      var newList = [];
      for (var i = 0; i < fileInput.files.length; i++) {
        var f = fileInput.files[i];
        if (!f) continue;
        newList.push({ file: f });
      }
      if (!newList.length) return;

      // 🔄 ここを「追加」ではなく「置き換え」に変更
      playlist = newList;
      currentIndex = -1;

      // 最初のトラックを自動再生
      loadTrack(0, true);

      // 同じファイルをもう一度選んでも change が発火するようにリセット
      fileInput.value = "";
    });

    // 再生ボタンなど
    playBtn.addEventListener("click", function () {
      togglePlay();
    });

    nextBtn.addEventListener("click", function () {
      goNext(true);
    });

    prevBtn.addEventListener("click", function () {
      goPrev(true);
    });

    seek.addEventListener("input", function () {
      if (!media.duration || media.duration <= 0) return;
      seeking = true;
      var ratio = Number(seek.value) / 1000;
      ratio = Math.max(0, Math.min(1, ratio));
      media.currentTime = ratio * media.duration;
      updateTimeUI();
    });

    seek.addEventListener("change", function () {
      seeking = false;
    });

    // 初期表示
    updateFilename();
    updateThumbVisibility();
    updateTimeUI();
    updatePlayButton();
    attachMediaEvents();
  }

  window.setupPlayer = setupPlayer;
})();
