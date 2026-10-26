import { Injectable, signal } from '@angular/core';

/** Tiny WebAudio synth: no audio files needed. */
@Injectable({ providedIn: 'root' })
export class SoundService {
  muted = signal(false);
  private ctx?: AudioContext;

  private tone(freq: number, dur: number, when = 0, vol = 0.07) {
    if (this.muted()) return;
    this.ctx ??= new AudioContext();
    const c = this.ctx;
    if (c.state === 'suspended') c.resume();
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur);
  }

  tick() {
    this.tone(480 + Math.random() * 80, 0.07);
  }
  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.4, i * 0.12, 0.09));
  }
}
