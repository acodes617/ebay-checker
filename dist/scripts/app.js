"use strict";
class EbayCheckerApp {
    constructor() {
        this.stream = null;
        this.track = null;
        this.flashOn = false;
        this.video = document.getElementById("camera");
        this.canvas = document.getElementById("cameraCanvas");
        this.overlay = document.getElementById("cameraOverlay");
        this.display = document.getElementById("calcDisplay");
        this.setupTabs();
        this.bindButtons();
        this.setupCalculator();
    }
    setupTabs() {
        const tabs = document.querySelectorAll(".tab-btn");
        const contents = document.querySelectorAll(".tab-content");
        tabs.forEach(tab => tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            contents.forEach(c => c.classList.remove("active"));
            const target = document.getElementById(tab.dataset.tab);
            target?.classList.add("active");
        }));
    }
    bindButtons() {
        document.getElementById("openCamera")?.addEventListener("click", () => this.openCamera());
        document.getElementById("closeCamera")?.addEventListener("click", () => this.closeCamera());
        document.getElementById("flashBtn")?.addEventListener("click", () => this.toggleFlash());
        document.getElementById("clearHistory")?.addEventListener("click", () => {
            const list = document.getElementById("historyList");
            list.innerHTML = "";
            localStorage.removeItem("ebayHistory");
        });
    }
    async openCamera() {
        if (this.stream)
            return;
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            this.video.srcObject = this.stream;
            await this.video.play();
            this.track = this.stream.getVideoTracks()[0];
            this.overlay.classList.remove("hidden");
        }
        catch (e) {
            alert("Camera failed");
            console.error(e);
        }
    }
    closeCamera() {
        this.stream?.getTracks().forEach(t => t.stop());
        this.stream = null;
        this.track = null;
        this.video.srcObject = null;
        this.overlay.classList.add("hidden");
    }
    async toggleFlash() {
        if (!this.track)
            return;
        const caps = this.track.getCapabilities?.();
        if (caps?.torch) {
            this.flashOn = !this.flashOn;
            await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] });
        }
        else
            alert("Flash not supported");
    }
    setupCalculator() {
        document.querySelectorAll(".calc-buttons button").forEach(btn => {
            const val = btn.dataset.value;
            if (val)
                btn.addEventListener("click", () => this.display.value += val);
        });
        document.getElementById("calcClear")?.addEventListener("click", () => this.display.value = "");
        document.getElementById("calcEquals")?.addEventListener("click", () => {
            try {
                this.display.value = eval(this.display.value);
            }
            catch {
                this.display.value = "Error";
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => new EbayCheckerApp());
