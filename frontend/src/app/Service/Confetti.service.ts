import { Injectable } from '@angular/core';

/** Dependency-free canvas confetti. */
@Injectable({ providedIn: 'root' })
export class ConfettiService {
  burst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas');
    cv.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
    cv.width = innerWidth;
    cv.height = innerHeight;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d')!;
    const colors = ['#0a84ff', '#ff375f', '#ffd60a', '#30d158', '#bf5af2', '#ff9f0a'];
    const ps = Array.from({ length: 150 }, () => ({
      x: cv.width / 2,
      y: cv.height * 0.6,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 16 - 6,
      s: 6 + Math.random() * 6,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    let t = 0;
    const frame = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of ps) {
        p.vy += 0.35;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 150);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (++t < 150) requestAnimationFrame(frame);
      else cv.remove();
    };
    frame();
  }
}
