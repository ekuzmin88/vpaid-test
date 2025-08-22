(function() {
  var VPAIDCreative = function() {
    this.slot = null;
    this.videoSlot = null;
    this.events = {};
    this.volume = 1.0;
    this.adParameters = null;
    this.activeElements = [];
    this.intervalId = null;
  };

  // === Utility: event dispatch ===
  VPAIDCreative.prototype._dispatch = function(event) {
    if (this.events[event]) {
      this.events[event]();
    }
  };

  // === Required VPAID methods ===
  VPAIDCreative.prototype.handshakeVersion = function(version) {
    return "2.0";
  };

  VPAIDCreative.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.slot = environmentVars.slot;
    this.videoSlot = environmentVars.videoSlot;

    // Parse AdParameters
    try {
      this.adParameters = JSON.parse(creativeData.AdParameters);
    } catch (e) {
      console.warn("AdParameters parse error", e);
      this.adParameters = {};
    }

    this._dispatch("AdLoaded");
  };

  VPAIDCreative.prototype.startAd = function() {
    var self = this;
    this._dispatch("AdStarted");

    if (this.videoSlot) {
      this.videoSlot.play();
      // Poll every 200ms for overlays
      this.intervalId = setInterval(function() {
        self._updateOverlays();
      }, 200);
    }
  };

  VPAIDCreative.prototype.stopAd = function() {
    if (this.intervalId) clearInterval(this.intervalId);
    this._dispatch("AdStopped");
  };

  VPAIDCreative.prototype.skipAd = function() {
    this._dispatch("AdSkipped");
  };

  VPAIDCreative.prototype.resizeAd = function(width, height, viewMode) {
    this._dispatch("AdSizeChange");
  };

  VPAIDCreative.prototype.pauseAd = function() {
    if (this.videoSlot) this.videoSlot.pause();
    this._dispatch("AdPaused");
  };

  VPAIDCreative.prototype.resumeAd = function() {
    if (this.videoSlot) this.videoSlot.play();
    this._dispatch("AdPlaying");
  };

  VPAIDCreative.prototype.expandAd = function() {
    this._dispatch("AdExpandedChange");
  };

  VPAIDCreative.prototype.collapseAd = function() {
    this._dispatch("AdExpandedChange");
  };

  VPAIDCreative.prototype.subscribe = function(callback, eventName) {
    this.events[eventName] = callback;
  };

  VPAIDCreative.prototype.unsubscribe = function(eventName) {
    delete this.events[eventName];
  };

  // === Volume handling (fixes tester error) ===
  VPAIDCreative.prototype.setAdVolume = function(volume) {
    this.volume = volume;
    if (this.videoSlot) this.videoSlot.volume = volume;
    this._dispatch("AdVolumeChange");
  };

  VPAIDCreative.prototype.getAdVolume = function() {
    return this.volume;
  };

  // === Ad info ===
  VPAIDCreative.prototype.getAdDuration = function() {
    return this.videoSlot ? this.videoSlot.duration : -1;
  };

  VPAIDCreative.prototype.getAdRemainingTime = function() {
    return this.videoSlot ? this.videoSlot.duration - this.videoSlot.currentTime : -1;
  };

  VPAIDCreative.prototype.getAdLinear = function() { return true; };
  VPAIDCreative.prototype.getAdExpanded = function() { return false; };
  VPAIDCreative.prototype.getAdSkippableState = function() { return false; };
  VPAIDCreative.prototype.getAdCompanions = function() { return ""; };
  VPAIDCreative.prototype.getAdIcons = function() { return false; };

  // === Overlay logic ===
  VPAIDCreative.prototype._updateOverlays = function() {
    if (!this.videoSlot || !this.adParameters || !this.adParameters.TemplateElements) return;
    var currentTime = this.videoSlot.currentTime;

    // Remove expired elements
    this.activeElements = this.activeElements.filter(function(el) {
      if (currentTime > el.end) {
        el.node.remove();
        return false;
      }
      return true;
    });

    // Add new elements
    var newElements = this.adParameters.TemplateElements.filter(function(el) {
      return currentTime >= el.StartTimeSec && currentTime <= el.EndTimeSec;
    });

    var self = this;
    newElements.forEach(function(el) {
      if (!self.activeElements.find(ae => ae.node.dataset.id === JSON.stringify(el))) {
        var node;
        if (el._t === "TextElementTemplate") {
          node = document.createElement("div");
          node.innerText = el.Text;
          node.style.position = "absolute";
          node.style.left = (el.X || 0) + "px";
          node.style.top = (el.Y || 0) + "px";
          node.style.fontSize = (el.FontSize || 20) + "px";
          node.style.color = el.FontColor || "white";
        } else if (el._t === "ImageElementTemplate") {
          node = document.createElement("img");
          node.src = el.Source;
          node.style.position = "absolute";
          node.style.left = (el.X || 0) + "px";
          node.style.top = (el.Y || 0) + "px";
          node.style.width = (el.Width || 100) + "px";
          node.style.height = (el.Height || 100) + "px";
        }
        if (node) {
          node.dataset.id = JSON.stringify(el);
          self.slot.appendChild(node);
          self.activeElements.push({ node: node, end: el.EndTimeSec });
        }
      }
    });
  };

  // Export
  window.getVPAIDAd = function() {
    return new VPAIDCreative();
  };
})();
