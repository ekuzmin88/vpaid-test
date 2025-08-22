(function() {
  function ShoppableVPAID() {
    this.subscribers = {};
  }

  ShoppableVPAID.prototype.handshakeVersion = function(version) {
    return "2.0";
  };

  ShoppableVPAID.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.slot = environmentVars.slot;
    this.videoSlot = environmentVars.videoSlot;

    if (this.slot) {
      this.slot.innerHTML = '<div style="color:white;position:absolute;top:20px;left:20px;">Shoppable Hybrid Loaded</div>';
    }

    this._emit("AdLoaded");
  };

  ShoppableVPAID.prototype.startAd = function() {
    this._emit("AdStarted");
  };

  ShoppableVPAID.prototype.stopAd = function() {
    this._emit("AdStopped");
  };

  ShoppableVPAID.prototype.subscribe = function(callback, eventName, context) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push({ cb: callback, ctx: context });
  };

  ShoppableVPAID.prototype.unsubscribe = function(callback, eventName) {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName] = this.subscribers[eventName].filter(sub => sub.cb !== callback);
    }
  };

  ShoppableVPAID.prototype.resizeAd = function(width, height, viewMode) {};
  ShoppableVPAID.prototype.pauseAd = function() {};
  ShoppableVPAID.prototype.resumeAd = function() {};
  ShoppableVPAID.prototype.setAdVolume = function(val) {};
  ShoppableVPAID.prototype.getAdVolume = function() { return 1; };
  ShoppableVPAID.prototype.getAdDuration = function() { return 30; };
  ShoppableVPAID.prototype.getAdRemainingTime = function() { return 10; };

  ShoppableVPAID.prototype._emit = function(eventName) {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName].forEach(sub => {
        try {
          sub.cb.call(sub.ctx, eventName);
        } catch (e) {
          console.error("Error in subscriber for", eventName, e);
        }
      });
    }
  };

  // === ВАЖНО: возвращаем ИМЕННО готовый объект с методами ===
  window.getVPAIDAd = function() {
    return new ShoppableVPAID();
  };
})();
