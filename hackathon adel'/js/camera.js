/**
 * camera.js
 * Handles live camera capture (getUserMedia) with a graceful fallback
 * to a plain file input (which opens the native camera app on mobile
 * via the `capture="environment"` attribute set in index.html).
 */

const Camera = {
  stream: null,
  photoDataUrl: null,

  els: {},

  init() {
    this.els = {
      video: document.getElementById('cameraVideo'),
      canvas: document.getElementById('cameraCanvas'),
      preview: document.getElementById('photoPreview'),
      placeholder: document.getElementById('photoPlaceholder'),
      btnOpen: document.getElementById('btnOpenCamera'),
      btnCapture: document.getElementById('btnCapture'),
      btnRetake: document.getElementById('btnRetake'),
      fileInput: document.getElementById('fileInput'),
      error: document.getElementById('cameraError')
    };

    this.els.btnOpen.addEventListener('click', () => this.openCamera());
    this.els.btnCapture.addEventListener('click', () => this.capture());
    this.els.btnRetake.addEventListener('click', () => this.retake());
    this.els.fileInput.addEventListener('change', (e) => this.handleFile(e));
  },

  async openCamera() {
    this.hideError();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      this.els.video.srcObject = this.stream;
      this.els.video.hidden = false;
      this.els.preview.hidden = true;
      this.els.placeholder.hidden = true;
      this.els.btnOpen.hidden = true;
      this.els.btnCapture.hidden = false;
      this.els.btnRetake.hidden = true;
    } catch (err) {
      console.warn('Camera access failed', err);
      this.showError('Нет доступа к камере. Можно загрузить фото из галереи ниже.');
    }
  },

  capture() {
    const { video, canvas } = this.els;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    this.stopStream();

    this.els.video.hidden = true;
    this.els.preview.src = this.photoDataUrl;
    this.els.preview.hidden = false;
    this.els.placeholder.hidden = true;
    this.els.btnCapture.hidden = true;
    this.els.btnOpen.hidden = true;
    this.els.btnRetake.hidden = false;

    document.dispatchEvent(new CustomEvent('photo-changed', { detail: this.photoDataUrl }));
  },

  retake() {
    this.photoDataUrl = null;
    this.els.preview.hidden = true;
    this.els.placeholder.hidden = false;
    this.els.btnOpen.hidden = false;
    this.els.btnRetake.hidden = true;
    this.els.fileInput.value = '';
    document.dispatchEvent(new CustomEvent('photo-changed', { detail: null }));
  },

  handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    this.hideError();
    this.stopStream();

    const reader = new FileReader();
    reader.onload = () => {
      this.photoDataUrl = reader.result;
      this.els.video.hidden = true;
      this.els.preview.src = this.photoDataUrl;
      this.els.preview.hidden = false;
      this.els.placeholder.hidden = true;
      this.els.btnOpen.hidden = false;
      this.els.btnCapture.hidden = true;
      this.els.btnRetake.hidden = false;
      document.dispatchEvent(new CustomEvent('photo-changed', { detail: this.photoDataUrl }));
    };
    reader.readAsDataURL(file);
  },

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  },

  reset() {
    this.stopStream();
    this.photoDataUrl = null;
    this.els.preview.hidden = true;
    this.els.video.hidden = true;
    this.els.placeholder.hidden = false;
    this.els.btnOpen.hidden = false;
    this.els.btnCapture.hidden = true;
    this.els.btnRetake.hidden = true;
    this.els.fileInput.value = '';
    this.hideError();
  },

  showError(msg) {
    this.els.error.textContent = msg;
    this.els.error.hidden = false;
  },
  hideError() {
    this.els.error.hidden = true;
  }
};
