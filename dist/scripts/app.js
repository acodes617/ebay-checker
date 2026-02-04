"use strict";
class EbayCheckerApp {
    constructor() {
        this.stream = null;
        this.track = null;
        this.flashOn = false;
        this.video = document.getElementById("camera");
        this.canvas = document.getElementById("cameraCanvas");
        this.cameraOverlay = document.getElementById("cameraOverlay");
        this.capturedImage = document.getElementById("capturedImage");
        this.scanResult = document.getElementById("scanResult");
        this.display = document.getElementById("calcDisplay");
        this.setupTabs();
        this.bindButtons();
        this.setupCalculator();
    }
    setupTabs() {
        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                var _a;
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
                (_a = document.getElementById(btn.dataset.tab)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
            });
        });
    }
    bindButtons() {
        var _a, _b, _c, _d;
        (_a = document.getElementById("openCamera")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => this.openCamera());
        (_b = document.getElementById("closeCamera")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => this.closeCamera());
        (_c = document.getElementById("flashBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => this.toggleFlash());
        (_d = document.getElementById("captureBtn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => this.captureImage());
    }
    async openCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            this.video.srcObject = this.stream;
            await this.video.play();
            this.track = this.stream.getVideoTracks()[0];
            this.cameraOverlay.classList.remove("hidden");
        }
        catch (_a) {
            alert("Camera access failed.");
        }
    }
    closeCamera() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(t => t.stop());
        this.stream = null;
        this.track = null;
        this.cameraOverlay.classList.add("hidden");
    }
    captureImage() {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const ctx = this.canvas.getContext("2d");
        ctx.drawImage(this.video, 0, 0);
        const imageData = this.canvas.toDataURL("image/png");
        this.capturedImage.src = imageData;
        this.closeCamera();
        this.showPlaceholderAnalysis();
    }
    showPlaceholderAnalysis() {
        this.scanResult.classList.remove("hidden");
        document.getElementById("detectedItem").textContent = "Electronics (placeholder)";
        document.getElementById("avgPrice").textContent = "$42.00";
        document.getElementById("priceRange").textContent = "$30.00 – $55.00";
    }
    async toggleFlash() {
        var _a, _b;
        if (!this.track)
            return;
        const caps = (_b = (_a = this.track).getCapabilities) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (caps && caps.torch) {
            this.flashOn = !this.flashOn;
            await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] });
        }
        else {
            alert("Flash not supported on this device.");
        }
    }
    setupCalculator() {
        var _a, _b;
        document.querySelectorAll(".calc-buttons button").forEach(btn => {
            const value = btn.dataset.value;
            if (value)
                btn.addEventListener("click", () => this.display.value += value);
        });
        (_a = document.getElementById("calcClear")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            this.display.value = "";
        });
        (_b = document.getElementById("calcEquals")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            try {
                this.display.value = eval(this.display.value);
            }
            catch (_a) {
                this.display.value = "Error";
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => new EbayCheckerApp());
