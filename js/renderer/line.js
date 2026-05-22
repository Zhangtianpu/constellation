import { easeOutCubic } from '../utils/math.js';

export class ConstellationLine {
  constructor(fromStar, toStar) {
    this.fromStar = fromStar;
    this.toStar = toStar;
    this.progress = 0;
    this.completed = false;
    this.error = false;
    this.errorTime = 0;
    this.fadeOut = false;
    this.fadeAlpha = 1;
    this.glowPhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.glowPhase += dt * 2;

    if (!this.completed && this.progress < 1) {
      this.progress = Math.min(1, this.progress + dt * 3);
      if (this.progress >= 1) {
        this.completed = true;
      }
    }

    if (this.error) {
      this.errorTime += dt;
      if (this.errorTime > 0.8) {
        this.fadeOut = true;
      }
    }

    if (this.fadeOut) {
      this.fadeAlpha -= dt * 3;
    }
  }

  isDead() {
    return this.fadeOut && this.fadeAlpha <= 0;
  }

  render(ctx) {
    if (this.fadeAlpha <= 0) return;

    const sx = this.fromStar.screenX;
    const sy = this.fromStar.screenY;
    const ex = this.toStar.screenX;
    const ey = this.toStar.screenY;

    const p = easeOutCubic(this.progress);
    const cx = sx + (ex - sx) * p;
    const cy = sy + (ey - sy) * p;

    ctx.save();
    ctx.globalAlpha = this.fadeAlpha;

    if (this.error) {
      this.renderErrorLine(ctx, sx, sy, cx, cy);
    } else if (this.fromStar.completed) {
      this.renderCompletedLine(ctx, sx, sy, cx, cy);
    } else {
      this.renderNormalLine(ctx, sx, sy, cx, cy);
    }

    ctx.restore();
  }

  renderNormalLine(ctx, sx, sy, ex, ey) {
    const glow = 0.7 + 0.3 * Math.sin(this.glowPhase);

    ctx.strokeStyle = `rgba(255, 215, 100, ${0.15 * glow})`;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 215, 100, ${0.5 * glow})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 220, ${0.8 * glow})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  renderCompletedLine(ctx, sx, sy, ex, ey) {
    const glow = 0.8 + 0.2 * Math.sin(this.glowPhase);

    ctx.strokeStyle = `rgba(255, 200, 50, ${0.2 * glow})`;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 200, 50, ${0.6 * glow})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 240, 180, ${0.9 * glow})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  renderErrorLine(ctx, sx, sy, ex, ey) {
    const flash = Math.sin(this.errorTime * 15) > 0 ? 0.7 : 0.3;

    ctx.strokeStyle = `rgba(255, 80, 80, ${0.2 * flash})`;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 100, 100, ${0.6 * flash})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
}
