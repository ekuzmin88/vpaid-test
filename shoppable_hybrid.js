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
    if (this.subscribers['AdLoaded']) {
      this.subscribers['AdLoaded'].forEach(cb => cb());
    }
  };

  ShoppableVPAID.prototype.subscribe = function(callback, eventName, context) {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push(callback.bind(context));
  };

  ShoppableVPAID.prototype.unsubscribe = function(callback, eventName) {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);
    }
  };

  ShoppableVPAID.prototype.startAd = function() {
    if (this.subscribers['AdStarted']) {
      this.subscribers['AdStarted'].forEach(cb => cb());
    }
  };

  ShoppableVPAID.prototype.stopAd = function() {
    if (this.subscribers['AdStopped']) {
      this.subscribers['AdStopped'].forEach(cb => cb());
    }
  };

  // обязательные заглушки
  ShoppableVPAID.prototype.resizeAd = function(width, height, viewMode) {};
  ShoppableVPAID.prototype.pauseAd = function() {};
  ShoppableVPAID.prototype.resumeAd = function() {};
  ShoppableVPAID.prototype.setAdVolume = function(val) {};
  ShoppableVPAID.prototype.getAdVolume = function() { return 1; };
  ShoppableVPAID.prototype.getAdDuration = function() { return 30; };
  ShoppableVPAID.prototype.getAdRemainingTime = function() { return 10; };

  window.getVPAIDAd = function() {
    return new ShoppableVPAID();
  };
})();
