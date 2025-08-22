(function() {
  function VPAIDCreative() {
    this.slot = null;
    this.videoSlot = null;
    this.events = {};
    this.volume = 1.0;
    this.adParameters = {};
    this.activeElements = [];
    this.intervalId = null;
  }

  VPAIDCreative.prototype._dispatch = function(event) {
    if (this.events[event]) {
      try {
        this.events[event](event);
      } catch (e) {
        console.error("Event dispatch error", event, e);
      }
    }
  };

  VPAIDCreative.prototype.handshakeVersion = function(version) { return "2.0"; };

  VPAIDCreative.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.slot = environmentVars.slot;
    this.videoSlot = environmentVars.videoSlot;

    try {
      this.adParameters = JSON.parse(creativeData.AdParameters);
    } catch(e) {
      console.warn("AdParameters parse error", e);
      this.adParameters = {};
    }

    this._dispatch("AdLoaded");
  };

  VPAIDCreative.prototype.startAd = function() {
    var self = this;
    if (this.videoSlot) {
      this.videoSlot.src = "https://content.hybrid.ai/mraid/shoppable_test/Lifestyle_30.mp4";
      this.videoSlot.autoplay = true;
      this.videoSlot.muted = true;
      this.videoSlot.play().catch(e => console.log("Autoplay error:", e));

      this.intervalId = setInterval(function() { self._updateOverlays(); }, 200);
    }
    this._dispatch("AdStarted");
  };

  VPAIDCreative.prototype.stopAd = function() {
    if (this.intervalId) clearInterval(this.intervalId);
    this._dispatch("AdStopped");
  };

  VPAIDCreative.prototype.subscribe = function(callback, eventName) { this.events[eventName] = callback; };
  VPAIDCreative.prototype.unsubscribe = function(eventName) { delete this.events[eventName]; };

  VPAIDCreative.prototype.setAdVolume = function(volume) { this.volume = volume; if (this.videoSlot) this.videoSlot.volume = volume; this._dispatch("AdVolumeChange"); };
  VPAIDCreative.prototype.getAdVolume = function() { return this.volume; };

  VPAIDCreative.prototype.getAdDuration = function() { return this.videoSlot ? this.videoSlot.duration : -1; };
  VPAIDCreative.prototype.getAdRemainingTime = function() { return this.videoSlot ? this.videoSlot.duration - this.videoSlot.currentTime : -1; };
  VPAIDCreative.prototype.getAdLinear = function() { return true; };

  VPAIDCreative.prototype._updateOverlays = function() {
    if (!this.videoSlot || !this.adParameters.TemplateElements) return;
    var currentTime = this.videoSlot.currentTime;
    // удалить устаревшие
    this.activeElements = this.activeElements.filter(el => {
      if (currentTime > el.end) { el.node.remove(); return false; }
      return true;
    });
    // добавить новые
    this.adParameters.TemplateElements.forEach(el => {
      var active = this.activeElements.find(ae => ae.node.dataset.id === JSON.stringify(el));
      if (currentTime >= el.StartTimeSec && currentTime <= el.EndTimeSec && !active) {
        var node;
        if (el._t === "TextElementTemplate") {
          node = document.createElement("div");
          node.innerText = el.Text;
          node.style.position = "absolute";
          node.style.left = (el.X||0)+"px";
          node.style.top = (el.Y||0)+"px";
          node.style.fontSize = (el.FontSize||20)+"px";
          node.style.color = el.FontColor||"white";
        } else if (el._t === "ImageElementTemplate") {
          node = document.createElement("img");
          node.src = el.Source;
          node.style.position = "absolute";
          node.style.left = (el.X||0)+"px";
          node.style.top = (el.Y||0)+"px";
          node.style.width = (el.Width||100)+"px";
          node.style.height = (el.Height||100)+"px";
        }
        if (node) {
          node.dataset.id = JSON.stringify(el);
          this.slot.appendChild(node);
          this.activeElements.push({ node: node, end: el.EndTimeSec });
        }
      }
    });
  };

  window.getVPAIDAd = function() { return new VPAIDCreative(); };
})();
