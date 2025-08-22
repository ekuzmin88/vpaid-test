(function() {
    function VPAIDCreative() {
        this.slot = null;
        this.videoSlot = null;
        this.events = {};
        this.isLinear = true;
        this.adVolume = 1.0;
    }

    // === ОБЯЗАТЕЛЬНЫЕ МЕТОДЫ API ===
    VPAIDCreative.prototype.handshakeVersion = function(version) {
        return "2.0";
    };

    VPAIDCreative.prototype.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
        this.slot = environmentVars.slot;
        this.videoSlot = environmentVars.videoSlot;

        // Простейший оверлей
        var overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = "20px";
        overlay.style.bottom = "20px";
        overlay.style.width = "300px";
        overlay.style.height = "100px";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.color = "#fff";
        overlay.style.padding = "10px";
        overlay.innerHTML = "<button style='font-size:16px;padding:8px 12px;'>Купить товар</button>";

        this.slot.appendChild(overlay);

        this._trigger("AdLoaded");
    };

    VPAIDCreative.prototype.startAd = function() {
        this._trigger("AdStarted");
    };

    VPAIDCreative.prototype.stopAd = function() {
        this._trigger("AdStopped");
    };

    VPAIDCreative.prototype.resizeAd = function(width, height, viewMode) {
        this._trigger("AdSizeChange");
    };

    VPAIDCreative.prototype.pauseAd = function() {
        this._trigger("AdPaused");
    };

    VPAIDCreative.prototype.resumeAd = function() {
        this._trigger("AdPlaying");
    };

    VPAIDCreative.prototype.expandAd = function() {
        this._trigger("AdExpanded");
    };

    VPAIDCreative.prototype.collapseAd = function() {
        this._trigger("AdCollapsed");
    };

    // === EVENTS ===
    VPAIDCreative.prototype.subscribe = function(callback, eventName, context) {
        this.events[eventName] = callback.bind(context);
    };

    VPAIDCreative.prototype.unsubscribe = function(eventName) {
        delete this.events[eventName];
    };

    VPAIDCreative.prototype._trigger = function(eventName) {
        if (this.events[eventName]) {
            this.events[eventName]();
        }
    };

    // === ГЕТТЕРЫ ===
    VPAIDCreative.prototype.getAdLinear = function() { return this.isLinear; };
    VPAIDCreative.prototype.getAdWidth = function() { return 300; };
    VPAIDCreative.prototype.getAdHeight = function() { return 100; };
    VPAIDCreative.prototype.getAdDuration = function() { return 15; };
    VPAIDCreative.prototype.getAdRemainingTime = function() { return 10; };
    VPAIDCreative.prototype.getAdVolume = function() { return this.adVolume; };
    VPAIDCreative.prototype.setAdVolume = function(val) { this.adVolume = val; };

    // Экспорт
    window.getVPAIDAd = function() {
        return new VPAIDCreative();
    };
})();
