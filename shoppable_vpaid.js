(function() {
  function ShoppableVPAID() {
    var slot, videoSlot, eventsCallbacks = {}, state = "loading";

    this.handshakeVersion = function(version) {
      return "2.0"; // VPAID spec version
    };

    this.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      slot = environmentVars.slot;
      videoSlot = environmentVars.videoSlot;

      if (videoSlot) {
        videoSlot.src = "https://content.hybrid.ai/mraid/shoppable_test/Lifestyle_30.mp4";
      }

      state = "initialized";
      if (eventsCallbacks["AdLoaded"]) eventsCallbacks["AdLoaded"]();
    };

    this.startAd = function() {
      if (videoSlot && videoSlot.play) {
        videoSlot.play();
      }
      state = "playing";

      // Демонстрация: через 3 сек добавляем карточку товара
      setTimeout(function() {
        if (slot) {
          var div = document.createElement("div");
          div.innerHTML = '<div style="position:absolute;top:10%;left:10%;background:white;padding:10px;border:2px solid #000;">' +
            '<img src="https://content.hybrid.ai/mraid/shoppable_test/product1.jpg" width="120"/><br/>' +
            '<button onclick="window.open(\'https://shop.example/product1\')">Купить</button></div>';
          slot.appendChild(div);
        }
      }, 3000);

      if (eventsCallbacks["AdStarted"]) eventsCallbacks["AdStarted"]();
    };

    this.stopAd = function() {
      state = "stopped";
      if (eventsCallbacks["AdStopped"]) eventsCallbacks["AdStopped"]();
    };

    this.skipAd = function() {
      this.stopAd();
      if (eventsCallbacks["AdSkipped"]) eventsCallbacks["AdSkipped"]();
    };

    this.resizeAd = function(width, height, viewMode) {};
    this.pauseAd = function() { if (videoSlot) videoSlot.pause(); };
    this.resumeAd = function() { if (videoSlot) videoSlot.play(); };
    this.expandAd = function() {};
    this.collapseAd = function() {};
    this.getAdLinear = function() { return true; };
    this.getAdWidth = function() { return 1280; };
    this.getAdHeight = function() { return 720; };
    this.getAdExpanded = function() { return false; };
    this.getAdSkippableState = function() { return true; };
    this.getAdRemainingTime = function() { return -1; };
    this.getAdDuration = function() { return 30; };
    this.getAdVolume = function() { return 1; };
    this.setAdVolume = function(val) {};
    this.subscribe = function(callback, eventName, context) {
      eventsCallbacks[eventName] = callback.bind(context);
    };
    this.unsubscribe = function(eventName) {
      delete eventsCallbacks[eventName];
    };
  }

  window.getVPAIDAd = function() {
    return new ShoppableVPAID();
  };
})();
