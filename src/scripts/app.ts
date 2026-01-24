class EbayCheckerApp {
  private video!: HTMLVideoElement;
  private canvas!: HTMLCanvasElement;
  private cameraOverlay!: HTMLDivElement;
  private historyList!: HTMLUListElement;
  private display!: HTMLInputElement;
  private stream: MediaStream | null = null;
  private track: any = null;
  private flashOn: boolean = false;
  private zoomLevel: number = 1;
  private initialPinchDistance: number | null = null;
  private initialZoom: number = 1;

  constructor() {
    // Elements
    this.video = document.getElementById('camera') as HTMLVideoElement;
    this.canvas = document.getElementById('cameraCanvas') as HTMLCanvasElement;
    this.cameraOverlay = document.getElementById('cameraOverlay') as HTMLDivElement;
    this.historyList = document.getElementById('historyList') as HTMLUListElement;
    this.display = document.getElementById('calcDisplay') as HTMLInputElement;

    // Tabs
    this.setupTabs();

    // Buttons
    this.bindButtons();

    // Load history
    this.loadHistory();

    // Calculator
    this.setupCalculator();
  }

  private setupTabs() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll<HTMLElement>('.tab-content').forEach(tab => tab.classList.remove('active'));
      const target = document.getElementById(btn.dataset.tab!);
      target?.classList.add('active');
    }));
  }

  private bindButtons() {
    const openBtn = document.getElementById('openCamera');
    const closeBtn = document.getElementById('closeCamera');
    const flashBtn = document.getElementById('flashBtn');
    const clearBtn = document.getElementById('clearHistory');

    if (!openBtn || !closeBtn || !flashBtn || !clearBtn) console.error('Buttons missing!');

    openBtn?.addEventListener('click', () => this.openCamera());
    closeBtn?.addEventListener('click', () => this.closeCamera());
    flashBtn?.addEventListener('click', () => this.toggleFlash());
    clearBtn?.addEventListener('click', () => {
      localStorage.removeItem('ebayHistory');
      this.historyList.innerHTML = '';
    });

    this.video.addEventListener('click', () => this.tapToFocus());
    this.video.addEventListener('touchstart', e => this.onTouchStart(e));
    this.video.addEventListener('touchmove', e => this.onTouchMove(e));
  }

  // --- Camera Methods ---
  private async openCamera() {
    if (this.stream) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } }, audio: false });
      this.video.srcObject = this.stream;
      this.video.play();
      this.track = this.stream.getVideoTracks()[0];
      this.cameraOverlay.classList.remove('hidden');
      requestAnimationFrame(() => this.checkBrightness());
    } catch (err) { console.error('Camera error:', err); alert('Cannot access camera'); }
  }

  private closeCamera() {
    if (!this.stream) return;
    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.track = null;
    this.cameraOverlay.classList.add('hidden');
  }

  private async toggleFlash() {
    if (!this.track) return;
    const caps = this.track.getCapabilities?.();
    if (caps?.torch) { this.flashOn = !this.flashOn; await this.track.applyConstraints({ advanced: [{ torch: this.flashOn }] }); }
    else alert('Flash not supported');
  }

  private tapToFocus() {
    if (!this.track) return;
    const caps = this.track.getCapabilities?.();
    if (caps?.focusMode?.includes('manual')) this.track.applyConstraints({ advanced: [{ focusMode: 'manual' }] });
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) { this.initialPinchDistance = this.getDistance(e.touches[0], e.touches[1]); this.initialZoom = this.zoomLevel; }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && this.initialPinchDistance && this.track) {
      const factor = this.getDistance(e.touches[0], e.touches[1]) / this.initialPinchDistance;
      const caps = this.track.getCapabilities();
      if (caps?.zoom) { this.zoomLevel = Math.min(caps.zoom.max, Math.max(caps.zoom.min, this.initialZoom * factor)); this.track.applyConstraints({ advanced: [{ zoom: this.zoomLevel }] }); }
    }
  }

  private getDistance(t1: Touch, t2: Touch) { return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY); }

  private checkBrightness() {
    if (!this.video) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    this.canvas.width = this.video.videoWidth; this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const data = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    let sum = 0; for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    const brightness = sum / (data.length / 4);
    document.getElementById('lightWarning')?.classList.toggle('hidden', brightness >= 60);
    requestAnimationFrame(() => this.checkBrightness());
  }

  // --- History ---
  private loadHistory() {
    const items = JSON.parse(localStorage.getItem('ebayHistory') || '[]');
    items.forEach((item: string) => this.addHistoryItem(item));
  }

  private addHistoryItem(item: string) {
    const li = document.createElement('li'); li.textContent = item; li.contentEditable = 'true'; this.historyList.appendChild(li);
  }

  // --- Calculator ---
  private setupCalculator() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.calc-buttons button');
    buttons.forEach(btn => {
      const value = btn.dataset.value;
      if (value) btn.addEventListener('click', () => { this.display.value += value; });
    });
    document.getElementById('calcClear')?.addEventListener('click', () => this.display.value = '');
    document.getElementById('calcEquals')?.addEventListener('click', () => {
      try { this.display.value = eval(this.display.value); } catch { this.display.value = 'Error'; }
    });
  }
}

new EbayCheckerApp();
