class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(frequency, duration, type = 'sine', vol = null) {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();

    const gainNode = this.ctx.createGain();
    gainNode.connect(this.ctx.destination);
    gainNode.gain.setValueAtTime((vol ?? this.volume) * 0.5, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    const oscillator = this.ctx.createOscillator();
    oscillator.connect(gainNode);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    oscillator.start(this.ctx.currentTime);
    oscillator.stop(this.ctx.currentTime + duration);
  }

  playConnect() {
    this.playTone(880, 0.15, 'sine');
    setTimeout(() => this.playTone(1100, 0.12, 'sine'), 80);
  }

  playError() {
    this.playTone(220, 0.3, 'triangle', 0.15);
  }

  playComplete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.4, 'sine'), i * 150);
    });
  }

  playClick() {
    this.playTone(600, 0.08, 'sine', 0.1);
  }

  playHover() {
    this.playTone(1200, 0.05, 'sine', 0.05);
  }

  playHint() {
    this.playTone(660, 0.2, 'triangle', 0.15);
    setTimeout(() => this.playTone(880, 0.2, 'triangle', 0.15), 120);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const audioManager = new AudioManager();
