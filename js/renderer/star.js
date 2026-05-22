export class Star {
  constructor(screenX, screenY, normX, normY, isConstellation, magnitude, name, starId) {
    this.screenX = screenX;
    this.screenY = screenY;
    this.normX = normX;
    this.normY = normY;
    this.isConstellation = isConstellation;
    this.magnitude = magnitude;
    this.name = name || '';
    this.starId = starId ?? -1;

    this.twinklePhase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = 0.8 + Math.random() * 2.0;

    this.baseScreenRadius = this.calcRadius();
    this.currentRadius = this.baseScreenRadius;

    this.hovered = false;
    this.selected = false;
    this.highlighted = false;
    this.completed = false;

    this.pulseTime = 0;
  }

  calcRadius() {
    if (!this.isConstellation) return 1 + Math.random() * 1.5;
    if (this.magnitude < 0) return 5 + Math.abs(this.magnitude) * 1.5;
    if (this.magnitude < 1) return 5;
    if (this.magnitude < 2) return 4;
    if (this.magnitude < 3) return 3.5;
    return 2.5;
  }

  updateScreenPos(canvasWidth, canvasHeight) {
    const margin = 0.1;
    const areaW = canvasWidth * (1 - margin * 2);
    const areaH = canvasHeight * (1 - margin * 2);
    const offsetX = canvasWidth * margin;
    const offsetY = canvasHeight * margin;
    this.screenX = this.normX * areaW + offsetX;
    this.screenY = this.normY * areaH + offsetY;
    this.baseScreenRadius = this.calcRadius();
  }

  update(dt) {
    this.twinklePhase += this.twinkleSpeed * dt;
    const twinkle = 0.7 + 0.3 * Math.sin(this.twinklePhase);
    this.currentRadius = this.baseScreenRadius * twinkle;

    if (this.hovered) this.currentRadius *= 1.4;
    if (this.selected) this.currentRadius *= 1.6;
    if (this.highlighted) {
      this.pulseTime += dt * 4;
      this.currentRadius *= 1.2 + 0.3 * Math.sin(this.pulseTime);
    }
    if (this.completed) this.currentRadius *= 1.3;
  }

  render(ctx) {
    const x = this.screenX;
    const y = this.screenY;
    const r = this.currentRadius;

    if (this.isConstellation) {
      this.renderConstellationStar(ctx, x, y, r);
    } else {
      this.renderDecoyStar(ctx, x, y, r);
    }
  }

  renderConstellationStar(ctx, x, y, r) {
    const glowRadius = r * 6;

    if (this.completed) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      grad.addColorStop(0, 'rgba(255, 215, 100, 0.8)');
      grad.addColorStop(0.2, 'rgba(255, 215, 100, 0.3)');
      grad.addColorStop(0.5, 'rgba(255, 180, 50, 0.1)');
      grad.addColorStop(1, 'rgba(255, 180, 50, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.highlighted) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      grad.addColorStop(0, 'rgba(150, 220, 255, 0.8)');
      grad.addColorStop(0.2, 'rgba(150, 220, 255, 0.3)');
      grad.addColorStop(0.5, 'rgba(100, 180, 255, 0.1)');
      grad.addColorStop(1, 'rgba(100, 180, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      grad.addColorStop(0, 'rgba(255, 255, 240, 0.6)');
      grad.addColorStop(0.15, 'rgba(255, 255, 220, 0.25)');
      grad.addColorStop(0.4, 'rgba(200, 220, 255, 0.08)');
      grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.hovered || this.selected || this.highlighted) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 240, 0.9)';
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if (this.hovered && this.name) {
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, x, y - r - 10);
    }
  }

  renderDecoyStar(ctx, x, y, r) {
    const twinkle = 0.4 + 0.6 * Math.sin(this.twinklePhase);
    const alpha = twinkle * 0.7;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    grad.addColorStop(0, `rgba(200, 220, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.2})`);
    grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}
