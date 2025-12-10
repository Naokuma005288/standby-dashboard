// src/widgetManager.js

(function () {
  const instances = []; // { plugin, element }
  let activeIndex = -1;
  let isAnimating = false;

  let container = null;
  let indicatorsEl = null;
  let titleEl = null;

  function setupWidgetPanel() {
    container = document.getElementById("widgetsContainer");
    indicatorsEl = document.getElementById("widgetsIndicators");
    titleEl = document.getElementById("currentWidgetTitle");

    if (!container) return;

    const registry = window.WidgetPlugins || [];

    registry.forEach(function (plugin) {
      createInstance(plugin);
    });

    if (instances.length > 0) {
      showWidgetAt(0, "init");
    }

    setupSwipe();
  }

  function createInstance(plugin) {
    const card = document.createElement("div");
    // 🔵 プラグインIDごとにクラス付与（テーマカラー用）
    const id = plugin.id || "default";
    card.className = "widget-card widget-" + id;

    const body = document.createElement("div");
    body.className = "widget-body";
    body.appendChild(plugin.createBodyElement());
    card.appendChild(body);

    instances.push({
      plugin: plugin,
      element: card,
    });
  }

  // 中身用のフェードインアニメーション
  function runInnerEnterAnimation(card) {
    const inner = card.querySelector(".widget-inner");
    if (!inner) return;
    // 一度外してから再付与してアニメーションをリスタート
    inner.classList.remove("widget-inner-animate");
    // 強制再描画
    void inner.offsetWidth;
    inner.classList.add("widget-inner-animate");
  }

  function showWidgetAt(index, direction) {
    if (!container) return;
    if (isAnimating) return;
    if (index < 0 || index >= instances.length) return;

    const newInstance = instances[index];
    const newEl = newInstance.element;

    const hasOld = activeIndex >= 0 && activeIndex < instances.length;
    const oldEl = hasOld ? instances[activeIndex].element : null;

    if (titleEl) {
      titleEl.textContent = newInstance.plugin.name || "Widget";
    }

    let inClass;
    let outClass;

    if (!hasOld || direction === "init") {
      inClass = "slide-in-from-bottom";
      outClass = "slide-out-to-top";
    } else if (direction === "next") {
      inClass = "slide-in-from-bottom";
      outClass = "slide-out-to-top";
    } else if (direction === "prev") {
      inClass = "slide-in-from-top";
      outClass = "slide-out-to-bottom";
    } else {
      inClass = "slide-in-from-bottom";
      outClass = "slide-out-to-top";
    }

    isAnimating = true;

    // 初回表示 or init
    if (!hasOld || direction === "init") {
      if (!newEl.parentNode) {
        container.appendChild(newEl);
      }
      runInnerEnterAnimation(newEl);
      newEl.classList.add(inClass);

      newEl.addEventListener("animationend", function handler() {
        newEl.removeEventListener("animationend", handler);
        newEl.classList.remove(inClass);
        activeIndex = index;
        isAnimating = false;
        updateIndicators();
      });

      return;
    }

    // 通常のスワイプ切り替え
    if (!newEl.parentNode) {
      container.appendChild(newEl);
    }
    runInnerEnterAnimation(newEl);

    if (oldEl && oldEl !== newEl) {
      oldEl.classList.add(outClass);
    }
    newEl.classList.add(inClass);

    newEl.addEventListener("animationend", function handler() {
      newEl.removeEventListener("animationend", handler);
      newEl.classList.remove(inClass);

      if (oldEl && oldEl !== newEl) {
        oldEl.classList.remove(outClass);
        if (oldEl.parentNode === container) {
          container.removeChild(oldEl);
        }
      }

      activeIndex = index;
      isAnimating = false;
      updateIndicators();
    });
  }

  function updateIndicators() {
    if (!indicatorsEl) return;
    indicatorsEl.innerHTML = "";

    if (!instances.length) return;

    for (var i = 0; i < instances.length; i++) {
      (function (iCaptured) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "pager-dot";
        if (iCaptured === activeIndex) {
          dot.classList.add("active");
        }
        dot.addEventListener("click", function () {
          if (iCaptured === activeIndex) return;
          const direction = iCaptured > activeIndex ? "next" : "prev";
          showWidgetAt(iCaptured, direction);
        });
        indicatorsEl.appendChild(dot);
      })(i);
    }
  }

  function setupSwipe() {
    if (!container) return;
    const target = container;

    let startX = 0;
    let startY = 0;
    let isTouching = false;

    // タッチ
    function onTouchStart(e) {
      if (!e.touches || !e.touches.length) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      isTouching = true;
    }

    function onTouchEnd(e) {
      if (!isTouching) return;
      isTouching = false;
      if (!e.changedTouches || !e.changedTouches.length) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (Math.abs(dy) < 40 || Math.abs(dx) > 80) return;

      if (dy < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    target.addEventListener("touchstart", onTouchStart, { passive: true });
    target.addEventListener("touchend", onTouchEnd);

    // マウスドラッグ
    let mouseDown = false;

    function onMouseDown(e) {
      mouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
    }

    function onMouseUp(e) {
      if (!mouseDown) return;
      mouseDown = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dy) < 60 || Math.abs(dx) > 80) return;

      if (dy < 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    target.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // マウスホイール
    target.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        if (Math.abs(e.deltaY) < 10) return;
        if (e.deltaY > 0) {
          goNext();
        } else {
          goPrev();
        }
      },
      { passive: false }
    );
  }

  function goNext() {
    if (!instances.length) return;
    if (activeIndex === -1) {
      showWidgetAt(0, "next");
      return;
    }
    const nextIndex = (activeIndex + 1) % instances.length;
    showWidgetAt(nextIndex, "next");
  }

  function goPrev() {
    if (!instances.length) return;
    if (activeIndex === -1) {
      showWidgetAt(0, "prev");
      return;
    }
    const prevIndex = (activeIndex - 1 + instances.length) % instances.length;
    showWidgetAt(prevIndex, "prev");
  }

  window.setupWidgetPanel = setupWidgetPanel;
})();
