import { randomRange } from '../utils/math.js';

export class BackgroundRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.bgStars = [];
    this.nebulae = [];
    this.meteors = [];
    this.meteorTimer = 0;
    this.width = 0;
    this.height = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.generateBgStars();
    this.generateNebulae();
  }

  generateBgStars() {
    this.bgStars = [];
    const count = Math.floor((this.width * this.height) / 3000);
    for (let i = 0; i < count; i++) {
      this.bgStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 0.3 + Math.random() * 1.2,
        alpha: 0.2 + Math.random() * 0.6,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        color: this.randomStarColor(),
      });
    }
  }

  generateNebulae() {
    this.nebulae = [];
    const count = 3 + Math.floor(Math.random() * 2);
    const colors = [
      [30, 20, 80],
      [50, 20, 70],
      [20, 30, 70],
      [40, 15, 60],
      [25, 35, 75],
    ];
    for (let i = 0; i < count; i++) {
      const c = colors[i % colors.length];
      this.nebulae.push({
        x: randomRange(0.1, 0.9) * this.width,
        y: randomRange(0.1, 0.9) * this.height,
        radiusX: randomRange(100, 300),
        radiusY: randomRange(80, 250),
        rotation: Math.random() * Math.PI,
        color: c,
        alpha: 0.03 + Math.random() * 0.04,
        driftX: randomRange(-0.3, 0.3),
        driftY: randomRange(-0.2, 0.2),
      });
    }
  }

  randomStarColor() {
    const r = Math.random();
    if (r < 0.5) return [255, 255, 240];
    if (r < 0.75) return [200, 220, 255];
    if (r < 0.9) return [255, 240, 200];
    return [255, 200, 180];
  }

  update(dt) {
    for (const star of this.bgStars) {
      star.twinklePhase += star.twinkleSpeed * dt;
    }

    for (const neb of this.nebulae) {
      neb.x += neb.driftX * dt;
      neb.y += neb.driftY * dt;
      if (neb.x < -100) neb.x = this.width + 100;
      if (neb.x > this.width + 100) neb.x = -100;
      if (neb.y < -100) neb.y = this.height + 100;
      if (neb.y > this.height + 100) neb.y = -100;
    }

    this.meteorTimer += dt;
    if (this.meteorTimer > 3 + Math.random() * 5) {
      this.meteorTimer = 0;
      this.spawnMeteor();
    }

    this.meteors = this.meteors.filter(m => {
      m.progress += dt * m.speed;
      return m.progress < 1;
    });
  }

  spawnMeteor() {
    const startX = randomRange(0, this.width);
    const startY = randomRange(0, this.height * 0.3);
    const angle = randomRange(0.3, 0.8);
    const length = randomRange(80, 200);
    this.meteors.push({
      startX, startY,
      angle, length,
      speed: randomRange(1.5, 3),
      progress: 0,
      alpha: 0.4 + Math.random() * 0.4,
    });
  }

  render(ctx) {
    this.renderGradient(ctx);
    this.renderNebulae(ctx);
    this.renderBgStars(ctx);
    this.renderMeteors(ctx);
  }

  renderGradient(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.4, '#0f0a35');
    grad.addColorStop(0.7, '#1a0a3e');
    grad.addColorStop(1, '#0d0825');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderNebulae(ctx) {
    for (const neb of this.nebulae) {
      ctx.save();
      ctx.translate(neb.x, neb.y);
      ctx.rotate(neb.rotation);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, neb.radiusX);
      const [r, g, b] = neb.color;
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${neb.alpha})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${neb.alpha * 0.5})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = grad;
      ctx.scale(1, neb.radiusY / neb.radiusX);
      ctx.beginPath();
      ctx.arc(0, 0, neb.radiusX, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderBgStars(ctx) {
    for (const star of this.bgStars) {
      const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
      const alpha = star.alpha * twinkle;
      const [r, g, b] = star.color;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderMeteors(ctx) {
    for (const m of this.meteors) {
      const p = m.progress;
      const headX = m.startX + Math.cos(m.angle) * m.length * p;
      const headY = m.startY + Math.sin(m.angle) * m.length * p;
      const tailP = Math.max(0, p - 0.3);
      const tailX = m.startX + Math.cos(m.angle) * m.length * tailP;
      const tailY = m.startY + Math.sin(m.angle) * m.length * tailP;

      const fadeAlpha = m.alpha * (1 - p);

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(0.7, `rgba(200, 220, 255, ${fadeAlpha * 0.5})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${fadeAlpha})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    }
  }
}
