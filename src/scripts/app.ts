class EbayCheckerApp {
  private video!: HTMLVideoElement;
  private canvas!: HTMLCanvasElement;
  private cameraOverlay!: HTMLDivElement;
  private historyList!: HTMLUListElement;
  private display!: HTMLInputElement;

  private stream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  private flashOn = false;

  constructor() {
    this.video = document.getElementById("camera") as HTMLVideoElement;
    this.canvas = document.getElementById("cameraCanvas") as HTMLCanvasElement;
    this.cameraOverlay = document.getElementById("cameraOverlay") as HTMLDivElement;
    this.historyList = document.getElementById("historyList") as HTMLUListElement;
    this.display = document.getElementById("calcDisplay") as HTMLInputElement;

    this.setupTabs();
    this.bindButtons();
    this.setupCalculator();
  }

  private setupTabs() {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll<HTMLElement>(".tab-content").forEach(tab => tab.classList.remove("active"));
        const target = document.getElementById(btn.dataset.tab!);
        target?.classList.add("active");
      });
    });
  }

  private bindButtons() {
    document.getElementById("openCamera")?.addEventListener("click", () => this.openCamera());
    document.getElementById("closeCamera")?.addEventListener("click", () => this.closeCamera());
    document.getElementById("flashBtn")?.addEventListener("click", () => this.toggleFlash());
    document.getElementById("clearHistory")?.addEventListener("click", () => {
      localStorage.removeItem("ebayHistory");
      this.historyList.innerHTML = "";
    });
  }

  private async openCamera() {
    if (this.stream) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.track = this.stream.getVideoTracks()[0];
      this.cameraOverlay.classList.remove("hidden");
    } catch {
      alert("Camera access failed.");
    }
  }

  private closeCamera() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.track = null;
    this.cameraOverlay.classList.add("hidden");
  }

  private async toggleFlash() {
    if (!this.track) return;
    const caps = this.track.getCapabilities?.();
    // TS-safe cast for torch
    if (caps && (caps as any).torch) {
      this.flashOn = !this.flashOn;
      await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] } as any);
    } else {
      alert("Flash not supported on this device.");
    }
  }

  private setupCalculator() {
    document.querySelectorAll<HTMLButtonElement>(".calc-buttons button").forEach(btn => {
      const value = btn.dataset.value;
      if (value) {
        btn.addEventListener("click", () => this.display.value += value);
      }
    });

    document.getElementById("calcClear")?.addEventListener("click", () => this.display.value = "");
    document.getElementById("calcEquals")?.addEventListener("click", () => {
      try { this.display.value = eval(this.display.value); }
      catch { this.display.value = "Error"; }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new EbayCheckerApp());
