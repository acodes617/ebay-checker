class EbayCheckerApp {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private overlay: HTMLDivElement;
  private display: HTMLInputElement;

  private stream: MediaStream | null = null;
  private track: any = null;
  private flashOn = false;

  constructor() {
    this.video = document.getElementById("camera") as HTMLVideoElement;
    this.canvas = document.getElementById("cameraCanvas") as HTMLCanvasElement;
    this.overlay = document.getElementById("cameraOverlay") as HTMLDivElement;
    this.display = document.getElementById("calcDisplay") as HTMLInputElement;

    this.setupTabs();
    this.bindButtons();
    this.setupCalculator();
  }

  private setupTabs() {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
    const contents = document.querySelectorAll<HTMLElement>(".tab-content");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        contents.forEach(c => c.classList.remove("active"));
        const target = document.getElementById(btn.dataset.tab!);
        target?.classList.add("active");
      });
    });
  }

  private bindButtons() {
    const openBtn = document.getElementById("openCamera");
    const closeBtn = document.getElementById("closeCamera");
    const flashBtn = document.getElementById("flashBtn");

    openBtn?.addEventListener("click", () => this.openCamera());
    closeBtn?.addEventListener("click", () => this.closeCamera());
    flashBtn?.addEventListener("click", () => this.toggleFlash());
  }

  private async openCamera() {
    if (this.stream) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.track = this.stream.getVideoTracks()[0];
      this.overlay.classList.remove("hidden");
    } catch (err) {
      alert("Camera access failed");
      console.error(err);
    }
  }

  private closeCamera() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.track = null;
    this.video.srcObject = null;
    this.overlay.classList.add("hidden");
  }

  private async toggleFlash() {
    if (!this.track) return;
    const caps = this.track.getCapabilities?.();
    if (caps?.torch) {
      this.flashOn = !this.flashOn;
      await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] });
    } else {
      alert("Flash not supported");
    }
  }

  private setupCalculator() {
    document.querySelectorAll<HTMLButtonElement>(".calc-buttons button").forEach(btn => {
      const val = btn.dataset.value;
      if (val) {
        btn.addEventListener("click", () => {
          this.display.value += val;
        });
      }
    });

    document.getElementById("calcClear")?.addEventListener("click", () => {
      this.display.value = "";
    });

    document.getElementById("calcEquals")?.addEventListener("click", () => {
      try {
        this.display.value = eval(this.display.value);
      } catch {
        this.display.value = "Error";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new EbayCheckerApp();
});
