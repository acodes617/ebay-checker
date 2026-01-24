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
  private cameraOverlay!: HTMLDivElement;
  private stream: MediaStream | null = null;
  private track: CameraTrack | null = null;
  private flashOn: boolean = false;
  private zoomLevel: number = 1;

  private initialPinchDistance: number | null = null;
  private initialZoom: number = 1;

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.video = document.getElementById('camera') as HTMLVideoElement;
      this.canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
      this.historyList = document.getElementById('historyList') as HTMLUListElement;
      this.cameraOverlay = document.getElementById('cameraOverlay') as HTMLDivElement;

      this.setupTabs();
      this.setupCameraControls();
      this.setupOpenCamera();
      this.loadHistory();
    });
  }

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

  private setupOpenCamera() {
    document.getElementById('openCamera')?.addEventListener('click', () => this.openCamera());
  }

  private async openCamera() {
    this.cameraOverlay.classList.remove('hidden');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
        audio: false
      });
      this.video.srcObject = this.stream;
      this.track = this.stream.getVideoTracks()[0] as CameraTrack;

      // Tap to focus
      this.video.addEventListener('click', e => this.handleFocus(e));

      // Pinch-to-zoom
      this.video.addEventListener('touchstart', e => this.onTouchStart(e));
      this.video.addEventListener('touchmove', e => this.onTouchMove(e));

      requestAnimationFrame(() => this.checkBrightness());
    } catch (err) {
      console.error('Camera failed:', err);
    }
  }

  private handleFocus(event: MouseEvent) {
    if (!this.track) return;
    const caps = this.track.getCapabilities();
    if (caps.focusMode?.includes('manual')) {
      this.track.applyConstraints({ advanced: [{ focusMode: 'manual' }] });
      console.log('Tap-to-focus');
    }
  }

  private async toggleFlash() {
    if (!this.track) return;
    const caps = this.track.getCapabilities();
    if (caps.torch) {
      this.flashOn = !this.flashOn;
      await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] });
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      this.initialPinchDistance = this.getDistance(e.touches[0], e.touches[1]);
      this.initialZoom = this.zoomLevel;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && this.initialPinchDistance !== null && this.track) {
      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const factor = currentDistance / this.initialPinchDistance;
      const caps = this.track.getCapabilities();
      if (caps.zoom) {
        this.zoomLevel = Math.min(caps.zoom.max, Math.max(caps.zoom.min, this.initialZoom * factor));
        this.track.applyConstraints({ advanced: [{ zoom: this.zoomLevel }] });
      }
    }
  }

  private getDistance(t1: Touch, t2: Touch) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  private setupCameraControls() {
    document.getElementById('flashBtn')?.addEventListener('click', () => this.toggleFlash());
    document.getElementById('closeCamera')?.addEventListener('click', () => this.closeCamera());
  }

  private closeCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.track = null;
    }
    this.cameraOverlay.classList.add('hidden');
  }

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

new EbayCheckerApp();
