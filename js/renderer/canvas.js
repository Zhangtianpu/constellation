import { Star } from './star.js';
import { ConstellationLine } from './line.js';
import { ParticleSystem } from './particle.js';
import { BackgroundRenderer } from './background.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.animFrameId = null;
    this.running = false;
    this.destroyed = false;

    this.background = new BackgroundRenderer(this);
    this.stars = [];
    this.lines = [];
    this.particles = new ParticleSystem();

    this._resizeHandler = () => this.resize();
    window.addEventListener('resize', this._resizeHandler);

    this.resize();
  }

  resize() {
    if (this.destroyed) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.background.resize(this.width, this.height);

    for (const star of this.stars) {
      star.updateScreenPos(this.width, this.height);
    }
  }

  setConstellation(constellationData) {
    this.stars = [];
    this.lines = [];
    this.particles.clear();

    const margin = 0.1;
    const areaW = this.width * (1 - margin * 2);
    const areaH = this.height * (1 - margin * 2);
    const offsetX = this.width * margin;
    const offsetY = this.height * margin;

    if (constellationData.decoyStars) {
      for (const ds of constellationData.decoyStars) {
        const star = new Star(
          ds.x * areaW + offsetX,
          ds.y * areaH + offsetY,
          ds.x, ds.y,
          false,
          ds.magnitude
        );
        this.stars.push(star);
      }
    }

    for (const s of constellationData.stars) {
      const star = new Star(
        s.x * areaW + offsetX,
        s.y * areaH + offsetY,
        s.x, s.y,
        true,
        s.magnitude,
        s.name,
        s.id
      );
      this.stars.push(star);
    }
  }

  addLine(fromStar, toStar) {
    const line = new ConstellationLine(fromStar, toStar);
    this.lines.push(line);
    return line;
  }

  removeLastLine() {
    if (this.lines.length > 0) {
      return this.lines.pop();
    }
    return null;
  }

  getConstellationStar(id) {
    return this.stars.find(s => s.isConstellation && s.starId === id);
  }

  getHitStar(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let closest = null;
    let closestDist = Infinity;

    for (const star of this.stars) {
      if (!star.isConstellation) continue;
      const dx = star.screenX - x;
      const dy = star.screenY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = Math.max(25, star.baseScreenRadius * 3);
      if (dist < hitRadius && dist < closestDist) {
        closest = star;
        closestDist = dist;
      }
    }
    return closest;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    this.destroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this._resizeHandler);
  }

  loop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.background.update(dt);
    this.background.render(this.ctx);

    for (const star of this.stars) {
      star.update(dt);
    }

    for (const star of this.stars) {
      if (!star.isConstellation) star.render(this.ctx);
    }

    for (const line of this.lines) {
      line.update(dt);
      line.render(this.ctx);
    }

    this.lines = this.lines.filter(l => !l.isDead());

    for (const star of this.stars) {
      if (star.isConstellation) star.render(this.ctx);
    }

    this.particles.update(dt);
    this.particles.render(this.ctx);

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  emitCelebration(cx, cy) {
    const colors = [
      'rgba(255, 215, 100, 1)',
      'rgba(255, 255, 220, 1)',
      'rgba(150, 200, 255, 1)',
      'rgba(255, 180, 100, 1)',
    ];
    for (let i = 0; i < 80; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.emit(cx, cy, 1, {
        speed: 1 + Math.random() * 4,
        decay: 0.008 + Math.random() * 0.015,
        size: 1 + Math.random() * 3,
        color,
      });
    }
  }
}
