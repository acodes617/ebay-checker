"use strict";
class EbayCheckerApp {
    constructor() {
        this.stream = null;
        this.track = null;
        this.flashOn = false;
        console.log("Constructor ran");
        this.video = document.getElementById("camera");
        this.canvas = document.getElementById("cameraCanvas");
        this.cameraOverlay = document.getElementById("cameraOverlay");
        this.historyList = document.getElementById("historyList");
        this.display = document.getElementById("calcDisplay");
        this.setupTabs();
        this.bindButtons();
        this.loadHistory();
        this.setupCalculator();
        document.body.addEventListener("click", e => {
            const el = e.target;
            if (el.tagName === "BUTTON") {
                console.log("BUTTON CLICK:", el.textContent);
            }
        });
    }
    setupTabs() {
        const buttons = document.querySelectorAll(".tab-btn");
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                document
                    .querySelectorAll(".tab-content")
                    .forEach(tab => tab.classList.remove("active"));
                const target = document.getElementById(btn.dataset.tab);
                target?.classList.add("active");
            });
        });
    }
    bindButtons() {
        document.getElementById("openCamera")?.addEventListener("click", () => this.openCamera());
        document.getElementById("closeCamera")?.addEventListener("click", () => this.closeCamera());
        document.getElementById("flashBtn")?.addEventListener("click", () => this.toggleFlash());
        document.getElementById("clearHistory")?.addEventListener("click", () => {
            localStorage.removeItem("ebayHistory");
            this.historyList.innerHTML = "";
        });
    }
    async openCamera() {
        if (this.stream)
            return;
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
        catch (err) {
            alert("Camera access failed");
            console.error(err);
        }
    }
    closeCamera() {
        this.stream?.getTracks().forEach(t => t.stop());
        this.stream = null;
        this.track = null;
        this.cameraOverlay.classList.add("hidden");
    }
    async toggleFlash() {
        if (!this.track)
            return;
        const caps = this.track.getCapabilities?.();
        if (caps?.torch) {
            this.flashOn = !this.flashOn;
            await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] });
        }
        else {
            alert("Flash not supported");
        }
    }
    loadHistory() {
        const items = JSON.parse(localStorage.getItem("ebayHistory") || "[]");
        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            this.historyList.appendChild(li);
        });
    }
    setupCalculator() {
        document.querySelectorAll(".calc-buttons button")
            .forEach(btn => {
            const value = btn.dataset.value;
            if (value) {
                btn.addEventListener("click", () => {
                    this.display.value += value;
                });
            }
        });
        document.getElementById("calcClear")?.addEventListener("click", () => {
            this.display.value = "";
        });
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
document.addEventListener("DOMContentLoaded", () => {
    console.log("EbayCheckerApp booting…");
    new EbayCheckerApp();
});
