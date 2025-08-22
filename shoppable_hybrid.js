(function() {
  var AdUnit = function() {
    this.slot = null;
    this.videoSlot = null;
    this.adDuration = 30;
    this.interval = null;
    this.elements = [];
    this.templateData = null;
    this.startTime = 0;
  };

  // === Обязательные методы VPAID ===
  AdUnit.prototype.handshakeVersion = function(version) {
    return "2.0";
  };

  AdUnit.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.slot = environmentVars.slot;
    this.videoSlot = environmentVars.videoSlot;

    // Создаем контейнер для оверлея
    this.overlay = document.createElement("div");
    this.overlay.style.position = "absolute";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100%";
    this.overlay.style.height = "100%";
    this.overlay.style.pointerEvents = "none"; // чтобы не мешать кликам по видео
    this.slot.appendChild(this.overlay);

    // Парсим Extension JSON
    try {
      if (creativeData && creativeData.AdParameters) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(creativeData.AdParameters, "text/xml");
        var extNode = xmlDoc.querySelector("Extension[type='hybe-spec']");
        if (extNode) {
          var jsonStr = extNode.textContent.trim();
          this.templateData = JSON.parse(jsonStr);
        }
      }
    } catch (e) {
      console.error("Ошибка парсинга Extension:", e);
    }

    if (!this.templateData) {
      console.warn("Нет templateData в Extension!");
    }

    this.startTime = Date.now();

    this.interval = setInterval(this.update.bind(this), 200);

    if (this.slot) {
      this.slot.dispatchEvent(new CustomEvent("AdLoaded"));
    }
  };

  AdUnit.prototype.startAd = function() {
    if (this.slot) {
      this.slot.dispatchEvent(new CustomEvent("AdStarted"));
    }
  };

  AdUnit.prototype.stopAd = function() {
    clearInterval(this.interval);
    if (this.slot) {
      this.slot.dispatchEvent(new CustomEvent("AdStopped"));
    }
  };

  AdUnit.prototype.resizeAd = function(width, height, viewMode) {};
  AdUnit.prototype.pauseAd = function() {};
  AdUnit.prototype.resumeAd = function() {};
  AdUnit.prototype.expandAd = function() {};
  AdUnit.prototype.collapseAd = function() {};
  AdUnit.prototype.getAdLinear = function() { return true; };
  AdUnit.prototype.getAdDuration = function() { return this.adDuration; };
  AdUnit.prototype.getAdRemainingTime = function() { return -1; };
  AdUnit.prototype.getAdVolume = function() { return 1; };
  AdUnit.prototype.setAdVolume = function(val) {};

  // === Логика отрисовки ===
  AdUnit.prototype.update = function() {
    if (!this.videoSlot || !this.templateData) return;
    var currentTime = this.videoSlot.currentTime;

    // Перебор элементов
    this.templateData.TemplateElements.forEach((el) => {
      var existing = this.elements.find(e => e.__id === el.ProductNumber + "_" + el.TextType + "_" + el.ImageType);
      var shouldBeVisible = (currentTime >= el.StartTimeSec && currentTime <= el.EndTimeSec);

      if (shouldBeVisible && !existing) {
        // Создаём новый элемент
        var domEl;
        if (el._t === "ImageElementTemplate") {
          domEl = document.createElement("img");
          domEl.src = el.Source;
          domEl.style.width = el.Width + "px";
          domEl.style.height = el.Height + "px";
        } else if (el._t === "TextElementTemplate") {
          domEl = document.createElement("div");
          domEl.textContent = el.Text || "";
          domEl.style.fontSize = el.FontSize + "px";
          domEl.style.color = el.FontColor || "white";
          domEl.style.fontFamily = this.templateData.FontName || "Arial";
        }

        if (domEl) {
          domEl.style.position = "absolute";
          domEl.style.left = el.X + "px";
          domEl.style.top = el.Y + "px";
          domEl.style.opacity = el.UseFade ? 0 : 1;
          domEl.style.transition = "opacity 0.5s ease";

          domEl.__id = el.ProductNumber + "_" + (el.TextType || "") + "_" + (el.ImageType || "");
          this.overlay.appendChild(domEl);
          this.elements.push(domEl);

          if (el.UseFade) {
            setTimeout(() => { domEl.style.opacity = 1; }, 50);
          }
        }
      }

      if (!shouldBeVisible && existing) {
        if (el.UseFade) {
          existing.style.opacity = 0;
          setTimeout(() => {
            if (existing.parentNode) existing.parentNode.removeChild(existing);
          }, 500);
        } else {
          if (existing.parentNode) existing.parentNode.removeChild(existing);
        }
        this.elements = this.elements.filter(e => e !== existing);
      }
    });
  };

  window.getVPAIDAd = function() {
    return new AdUnit();
  };
})();
