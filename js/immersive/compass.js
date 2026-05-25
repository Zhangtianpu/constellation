import { i18n } from '../utils/i18n.js';

export class Compass {
  constructor(container) {
    this.container = container;
    this._langUnsub = null;
    this.el = document.createElement('div');
    this.el.className = 'compass-overlay';
    this._updateLabels();
    container.appendChild(this.el);

    this._langUnsub = i18n.onLangChange(() => this._updateLabels());
  }

  _updateLabels() {
    this.el.innerHTML = `
      <div class="compass-n">${i18n.t('north')}</div>
      <div class="compass-e">${i18n.t('east')}</div>
      <div class="compass-s">${i18n.t('south')}</div>
      <div class="compass-w">${i18n.t('west')}</div>
    `;
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
    if (this._langUnsub) this._langUnsub();
    if (this.el.parentElement) {
      this.el.parentElement.removeChild(this.el);
    }
  }
}
