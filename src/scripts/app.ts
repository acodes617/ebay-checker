class EbayCheckerApp {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private cameraOverlay: HTMLDivElement;
  private capturedImage: HTMLImageElement;
  private scanResult: HTMLDivElement;
  private display: HTMLInputElement;

  private stream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  private flashOn = false;

  constructor() {
    this.video = document.getElementById("camera") as HTMLVideoElement;
    this.canvas = document.getElementById("cameraCanvas") as HTMLCanvasElement;
    this.cameraOverlay = document.getElementById("cameraOverlay") as HTMLDivElement;
    this.capturedImage = document.getElementById("capturedImage") as HTMLImageElement;
    this.scanResult = document.getElementById("scanResult") as HTMLDivElement;
    this.display = document.getElementById("calcDisplay") as HTMLInputElement;

    this.setupTabs();
    this.bindButtons();
    this.setupCalculator();
  }

  private setupTabs() {
    document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
        document.getElementById(btn.dataset.tab!)?.classList.add("active");
      });
    });
  }

  private bindButtons() {
    document.getElementById("openCamera")?.addEventListener("click", () => this.openCamera());
    document.getElementById("closeCamera")?.addEventListener("click", () => this.closeCamera());
    document.getElementById("flashBtn")?.addEventListener("click", () => this.toggleFlash());
    document.getElementById("captureBtn")?.addEventListener("click", () => this.captureImage());
  }

  private async openCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });

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

  private captureImage() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    const ctx = this.canvas.getContext("2d")!;
    ctx.drawImage(this.video, 0, 0);

    const imageData = this.canvas.toDataURL("image/png");
    this.capturedImage.src = imageData;

    this.closeCamera();
    this.showPlaceholderAnalysis();
  }

  private showPlaceholderAnalysis() {
    this.scanResult.classList.remove("hidden");
    (document.getElementById("detectedItem") as HTMLElement).textContent = "Electronics (placeholder)";
    (document.getElementById("avgPrice") as HTMLElement).textContent = "$42.00";
    (document.getElementById("priceRange") as HTMLElement).textContent = "$30.00 – $55.00";
  }

  private async toggleFlash() {
    if (!this.track) return;
    const caps = this.track.getCapabilities?.();
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
      if (value) btn.addEventListener("click", () => this.display.value += value);
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

document.addEventListener("DOMContentLoaded", () => new EbayCheckerApp());
