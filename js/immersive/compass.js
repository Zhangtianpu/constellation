export class Compass {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'compass-overlay';
    this.el.innerHTML = `
      <div class="compass-n">北</div>
      <div class="compass-e">东</div>
      <div class="compass-s">南</div>
      <div class="compass-w">西</div>
    `;
    container.appendChild(this.el);
  }

  update(azimuth) {
    const n = this.el.querySelector('.compass-n');
    const e = this.el.querySelector('.compass-e');
    const s = this.el.querySelector('.compass-s');
    const w = this.el.querySelector('.compass-w');

    const dirs = [
      { el: n, angle: 0 },
      { el: e, angle: 90 },
      { el: s, angle: 180 },
      { el: w, angle: 270 },
    ];

    for (const d of dirs) {
      let diff = ((d.angle - azimuth + 180) % 360 + 360) % 360 - 180;
      const absDiff = Math.abs(diff);
      const opacity = Math.max(0, 1 - absDiff / 90);
      d.el.style.opacity = opacity;

      if (absDiff < 45) {
        d.el.classList.add('compass-active');
      } else {
        d.el.classList.remove('compass-active');
      }
    }
  }

  dispose() {
    if (this.el.parentElement) {
      this.el.parentElement.removeChild(this.el);
    }
  }
}
