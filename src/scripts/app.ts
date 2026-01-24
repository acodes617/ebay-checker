// src/scripts/app.ts

// Custom interfaces for advanced camera constraints
interface AdvancedCameraConstraints {
  focusMode?: 'auto' | 'manual';
  torch?: boolean;
  zoom?: number;
}

interface CameraTrack extends MediaStreamTrack {
  applyConstraints(constraints: MediaTrackConstraints & { advanced?: AdvancedCameraConstraints[] }): Promise<void>;
  getCapabilities(): MediaTrackCapabilities & {
    focusMode?: string[];
    torch?: boolean;
    zoom?: { min: number; max: number; step: number };
  };
}

class EbayCheckerApp {
  private video!: HTMLVideoElement;
  private canvas!: HTMLCanvasElement;
  private historyList!: HTMLUListElement;
  private stream: MediaStream | null = null;
  private track: CameraTrack | null = null;
  private flashOn: boolean = false;
  private zoomLevel: number = 1;

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.video = document.getElementById('camera') as HTMLVideoElement;
      this.canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
      this.historyList = document.getElementById('historyList') as HTMLUListElement;

      this.setupTabs();
      this.setupCameraControls();
      this.loadHistory();
      this.initCamera();
    });
  }

  // --- Tabs ---
  private setupTabs() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll<HTMLElement>('.tab-content').forEach(tab => tab.classList.remove('active'));
        const target = document.getElementById(btn.dataset.tab!);
        target?.classList.add('active');
      });
    });
  }

  // --- Camera ---
  private async initCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
        audio: false
      });

      this.video.srcObject = this.stream;

      this.track = this.stream.getVideoTracks()[0] as CameraTrack;

      // Tap to focus
      this.video.addEventListener('click', e => this.handleFocus(e));

      // Start brightness check
      requestAnimationFrame(() => this.checkBrightness());
    } catch (err) {
      console.error('Camera initialization failed:', err);
    }
  }

  private handleFocus(event: MouseEvent) {
    if (!this.track) return;
    const capabilities = this.track.getCapabilities();

    if (capabilities.focusMode?.includes('manual')) {
      this.track.applyConstraints({ advanced: [{ focusMode: 'manual' }] });
      console.log('Tap-to-focus triggered.');
    }
  }

  private async toggleFlash() {
    if (!this.track) return;
    const capabilities = this.track.getCapabilities();

    if (capabilities.torch) {
      this.flashOn = !this.flashOn;
      await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] });
    }
  }

  private adjustZoom(delta: number) {
    if (!this.track) return;
    const capabilities = this.track.getCapabilities();

    if (capabilities.zoom) {
      this.zoomLevel = Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min, this.zoomLevel + delta));
      this.track.applyConstraints({ advanced: [{ zoom: this.zoomLevel }] });
    }
  }

  private setupCameraControls() {
    document.getElementById('flashBtn')?.addEventListener('click', () => this.toggleFlash());
    document.getElementById('zoomIn')?.addEventListener('click', () => this.adjustZoom(0.1));
    document.getElementById('zoomOut')?.addEventListener('click', () => this.adjustZoom(-0.1));
  }

  // --- Light monitoring ---
  private checkBrightness() {
    if (!this.video) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const data = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;

    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const brightness = sum / (data.length / 4);

    const warning = document.getElementById('lightWarning');
    if (brightness < 60) warning?.classList.remove('hidden');
    else warning?.classList.add('hidden');

    requestAnimationFrame(() => this.checkBrightness());
  }

  // --- History ---
  private loadHistory() {
    const items = JSON.parse(localStorage.getItem('ebayHistory') || '[]');
    items.forEach((item: string) => this.addHistoryItem(item));

    document.getElementById('clearHistory')?.addEventListener('click', () => {
      localStorage.removeItem('ebayHistory');
      this.historyList.innerHTML = '';
    });
  }

  private addHistoryItem(item: string) {
    const li = document.createElement('li');
    li.textContent = item;
    li.contentEditable = 'true';
    this.historyList.appendChild(li);
  }
}

// Initialize app
new EbayCheckerApp();
