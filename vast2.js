(function() {
  var ShoppableCreative = function() {
    this.slot = null;
    this.videoSlot = null;
    this.events = {};
    this.templateElements = [];
  };

  ShoppableCreative.prototype.handshakeVersion = function(version) {
    return "2.0";
  };

  ShoppableCreative.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.slot = environmentVars.slot;
    this.videoSlot = environmentVars.videoSlot;

    // Запускаем видео
    if (this.videoSlot) {
      this.videoSlot.src = "https://content.hybrid.ai/mraid/shoppable_test/Lifestyle_30.mp4";
      this.videoSlot.autoplay = true;
      this.videoSlot.muted = true;
      this.videoSlot.play().catch(function(e){ console.log("Autoplay blocked:", e); });
    }

    // Парсим JSON
    if (creativeData && creativeData.AdParameters) {
      try {
        var params = JSON.parse(creativeData.AdParameters);
        this.templateElements = params.TemplateElements || [];
      } catch(e) {
        console.error("Bad AdParameters JSON", e);
      }
    }

    // Рендерим элементы
    this.renderElements();

    if (this.events.AdLoaded) this.events.AdLoaded();
  };

  ShoppableCreative.prototype.renderElements = function() {
    var self = this;
    this.templateElements.forEach(function(el) {
      var node;
      if (el._t === "ImageElementTemplate") {
        node = document.createElement("img");
        node.src = el.Source;
        node.style.width = el.Width + "px";
        node.style.height = el.Height + "px";
      } else if (el._t === "TextElementTemplate") {
        node = document.createElement("div");
        node.innerText = el.Text;
        node.style.fontSize = el.FontSize + "px";
        node.style.color = el.FontColor;
      }
      node.style.position = "absolute";
      node.style.left = el.X + "px";
      node.style.top = el.Y + "px";
      self.slot.appendChild(node);
    });
  };

  ShoppableCreative.prototype.startAd = function() {
    if (this.events.AdStarted) this.events.AdStarted();
  };

  ShoppableCreative.prototype.stopAd = function() {
    if (this.events.AdStopped) this.events.AdStopped();
  };

  ShoppableCreative.prototype.subscribe = function(callback, eventName) {
    this.events[eventName] = callback;
  };

  ShoppableCreative.prototype.unsubscribe = function(eventName) {
    delete this.events[eventName];
  };

  window.getVPAIDAd = function() {
    return new ShoppableCreative();
  };
})();
