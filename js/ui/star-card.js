import { i18n } from '../utils/i18n.js';

export class StarCard {
  constructor(container, constellationData, seasonName, gameMode) {
    this.container = container;
    this.el = null;
    this.canvas = null;

    const card = document.createElement('div');
    card.className = 'star-card-overlay';

    const inner = document.createElement('div');
    inner.className = 'star-card glass-panel';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'star-card-constellation';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'star-card-canvas';
    this.canvas.width = 240;
    this.canvas.height = 240;
    canvasWrap.appendChild(this.canvas);
    inner.appendChild(canvasWrap);

    const info = document.createElement('div');
    info.className = 'star-card-info';
    info.innerHTML = `
      <h2 class="star-card-name">${constellationData.name}</h2>
      <p class="star-card-name-en">${constellationData.nameEn}</p>
      <p class="star-card-season">${i18n.t('bestViewing')}${seasonName}</p>
      <p class="star-card-story">${constellationData.story}</p>
    `;
    inner.appendChild(info);

    card.appendChild(inner);
    container.appendChild(card);
    this.el = card;

    this.drawConstellation(constellationData, gameMode);

    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });
  }

  drawConstellation(data, gameMode) {
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width;
    const h = this.canvas.height;

    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, '#0d0d3a');
    grad.addColorStop(1, '#050520');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 50; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      const sr = 0.3 + Math.random() * 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${0.2 + Math.random() * 0.3})`;
      ctx.fill();
    }

    const edges = data.edges || [];
    const starScreenPos = {};

    if (gameMode === 'immersive' && data.stars_3d && data.stars_3d.length > 0) {
      const stars3d = data.stars_3d;
      let minRa = Infinity, maxRa = -Infinity, minDec = Infinity, maxDec = -Infinity;
      for (const s of stars3d) {
        if (s.ra < minRa) minRa = s.ra;
        if (s.ra > maxRa) maxRa = s.ra;
        if (s.dec < minDec) minDec = s.dec;
        if (s.dec > maxDec) maxDec = s.dec;
      }

      const padding = 40;
      const rangeRa = Math.max(maxRa - minRa, 0.01);
      const rangeDec = Math.max(maxDec - minDec, 0.01);
      const scale = Math.min((w - padding * 2) / rangeRa, (h - padding * 2) / rangeDec);

      const offsetX = (w - rangeRa * scale) / 2;
      const offsetY = (h - rangeDec * scale) / 2;

      for (const s of stars3d) {
        starScreenPos[s.id] = {
          x: (s.ra - minRa) * scale + offsetX,
          y: (maxDec - s.dec) * scale + offsetY,
        };
      }

      this._drawPattern(ctx, starScreenPos, edges, stars3d, w, h);
    } else {
      const stars = data.stars || [];
      if (stars.length === 0) return;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const s of stars) {
        if (s.x < minX) minX = s.x;
        if (s.x > maxX) maxX = s.x;
        if (s.y < minY) minY = s.y;
        if (s.y > maxY) maxY = s.y;
      }

      const padding = 40;
      const rangeX = Math.max(maxX - minX, 0.01);
      const rangeY = Math.max(maxY - minY, 0.01);
      const scale = Math.min((w - padding * 2) / rangeX, (h - padding * 2) / rangeY);

      const offsetX = (w - rangeX * scale) / 2;
      const offsetY = (h - rangeY * scale) / 2;

      for (const s of stars) {
        starScreenPos[s.id] = {
          x: (s.x - minX) * scale + offsetX,
          y: (s.y - minY) * scale + offsetY,
        };
      }

      this._drawPattern(ctx, starScreenPos, edges, stars, w, h);
    }
  }

  _drawPattern(ctx, starScreenPos, edges, stars, w, h) {
    ctx.strokeStyle = '#ffd764';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffd764';
    ctx.shadowBlur = 8;
    for (const edge of edges) {
      const from = starScreenPos[edge.from];
      const to = starScreenPos[edge.to];
      if (!from || !to) continue;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    for (const s of stars) {
      const pos = starScreenPos[s.id];
      if (!pos) continue;
      const mag = s.magnitude || s.mag || 3;
      const r = Math.max(2, 5 - mag * 0.8);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 100, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff8e0';
      ctx.fill();
    }
  }

  dispose() {
    if (this.el && this.el.parentElement) {
      this.el.style.transition = 'opacity 0.3s ease';
      this.el.style.opacity = '0';
      setTimeout(() => {
        if (this.el && this.el.parentElement) {
          this.el.parentElement.removeChild(this.el);
        }
      }, 300);
    }
  }
}
