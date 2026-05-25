import { ImmersiveGameEngine } from '../game/immersive-engine.js';
import { Compass } from '../immersive/compass.js';
import { ProximityIndicator } from '../immersive/proximity-indicator.js';
import { StarCard } from './star-card.js';
import { audioManager } from '../utils/audio.js';
import { i18n } from '../utils/i18n.js';

export class ImmersiveGameplayPage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this.engine = null;
    this.canvas = null;
    this.compass = null;
    this.proximityIndicator = null;
    this.starCatalog = null;
    this._langUnsub = null;
  }

  async render() {
    if (this._langUnsub) {
      this._langUnsub();
    }
    this.container.innerHTML = '';

    const state = this.store.getState();
    const data = state.constellationData;
    if (!data) return;

    const seasonIdx = state.currentSeason ?? 0;
    const constIdx = state.currentLevel ?? 0;
    const constellation = data.seasons[seasonIdx]?.constellations[constIdx];
    if (!constellation) return;

    const page = document.createElement('div');
    page.className = 'page immersive-page';

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'immersive-canvas-container';
    page.appendChild(canvasContainer);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'immersive-canvas';
    canvasContainer.appendChild(this.canvas);

    const overlay = document.createElement('div');
    overlay.className = 'immersive-ui-overlay';

    const topBar = document.createElement('div');
    topBar.className = 'game-top-bar glass-panel';

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-icon-sm';
    backBtn.textContent = '←';
    backBtn.addEventListener('click', () => {
      audioManager.playClick();
      this.destroy();
      this.store.navigate('levelSelect');
    });
    topBar.appendChild(backBtn);

    const nameEl = document.createElement('div');
    nameEl.className = 'game-constellation-info';
    nameEl.innerHTML = `<span class="name-cn">${i18n.constellationName(constellation)}</span><span class="name-en">${constellation.nameEn}</span><span class="name-sep">·</span><span class="name-desc">${i18n.constellationHint(constellation)}</span>`;
    topBar.appendChild(nameEl);

    const timerEl = document.createElement('div');
    timerEl.className = 'game-timer';
    timerEl.textContent = '0:00';
    topBar.appendChild(timerEl);

    overlay.appendChild(topBar);

    const hintPanel = document.createElement('div');
    hintPanel.className = 'immersive-hint-panel glass-panel';
    hintPanel.innerHTML = `<div class="hint-icon">💡</div><div class="hint-text-immersive">${constellation.directionHint || i18n.t('rotateHint')}</div>`;
    overlay.appendChild(hintPanel);

    const bottomBar = document.createElement('div');
    bottomBar.className = 'game-bottom-bar';

    const hintBtn = document.createElement('button');
    hintBtn.className = 'btn btn-action glass-panel';
    hintBtn.innerHTML = `<span class="btn-icon">💡</span><span class="btn-label">${i18n.t('hint')}</span>`;
    hintBtn.addEventListener('click', () => {
      const text = this.engine.useHint();
      if (text) {
        hintPanel.querySelector('.hint-text-immersive').textContent = text;
        hintPanel.classList.add('hint-flash');
        setTimeout(() => hintPanel.classList.remove('hint-flash'), 500);
      }
    });
    bottomBar.appendChild(hintBtn);

    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-action glass-panel';
    undoBtn.innerHTML = `<span class="btn-icon">↩</span><span class="btn-label">${i18n.t('undo')}</span>`;
    undoBtn.addEventListener('click', () => {
      this.engine.undo();
    });
    bottomBar.appendChild(undoBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-action glass-panel';
    resetBtn.innerHTML = `<span class="btn-icon">🔄</span><span class="btn-label">${i18n.t('reset')}</span>`;
    resetBtn.addEventListener('click', () => {
      this.destroy();
      this.render();
    });
    bottomBar.appendChild(resetBtn);

    overlay.appendChild(bottomBar);

    this.errorToast = document.createElement('div');
    this.errorToast.className = 'error-toast';
    this.errorToast.style.display = 'none';
    overlay.appendChild(this.errorToast);

    page.appendChild(overlay);
    this.container.appendChild(page);

    this.compass = new Compass(page);
    this.proximityIndicator = new ProximityIndicator(page);

    this._langUnsub = i18n.onLangChange(() => this.render());

    try {
      if (!this.starCatalog) {
        const resp = await fetch('data/star-catalog.json');
        this.starCatalog = (await resp.json()).stars;
      }

      this.engine = new ImmersiveGameEngine(this.store);

      this.engine.onTimerUpdate = (elapsed) => {
        timerEl.textContent = this.engine.formatTime(elapsed);
      };

      this.engine.onError = (msg) => {
        this.showError(msg);
      };

      this.engine.onHintUpdate = (level) => {
        const text = this.engine.getHintText();
        hintPanel.querySelector('.hint-text-immersive').textContent = text;
        if (level >= 2) hintPanel.classList.add('hint-flash');
        setTimeout(() => hintPanel.classList.remove('hint-flash'), 500);
      };

      this.engine.onProximityUpdate = (prox) => {
        if (this.proximityIndicator) this.proximityIndicator.update(prox);
        if (this.compass) this.compass.update(this.engine.controls.azimuth);
      };

      this.engine.onComplete = (result) => {
        const seasonName = i18n.getSeasonName(seasonIdx);
        const gameMode = this.store.getState().gameMode || 'immersive';
        const starCard = new StarCard(page, constellation, seasonName, gameMode);

        setTimeout(() => {
          starCard.dispose();
          this.store.navigate('result', {
            lastResult: result,
            currentSeason: seasonIdx,
            currentLevel: constIdx,
          });
        }, 4000);
      };

      await this.engine.init(this.canvas, constellation, this.starCatalog);

      let pointerDownX = 0;
      let pointerDownY = 0;
      let pointerDownTime = 0;
      const CLICK_THRESHOLD = 8;
      const CLICK_TIME_LIMIT = 300;

      this.canvas.addEventListener('pointerdown', (e) => {
        pointerDownX = e.clientX;
        pointerDownY = e.clientY;
        pointerDownTime = Date.now();
      });

      this.canvas.addEventListener('pointerup', (e) => {
        const dx = e.clientX - pointerDownX;
        const dy = e.clientY - pointerDownY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const elapsed = Date.now() - pointerDownTime;

        if (dist < CLICK_THRESHOLD && elapsed < CLICK_TIME_LIMIT) {
          if (this.engine) this.engine.handleStarClick(e.clientX, e.clientY);
        }
      });

      const resizeObserver = new ResizeObserver(() => {
        if (this.engine && this.canvas) {
          this.engine.resize(this.canvas.clientWidth, this.canvas.clientHeight);
        }
      });
      resizeObserver.observe(this.canvas);
      this._resizeObserver = resizeObserver;

    } catch (e) {
      console.error('Failed to initialize immersive mode:', e);
      const errorEl = document.createElement('div');
      errorEl.className = 'immersive-error glass-panel';
      errorEl.innerHTML = `
        <h3>${i18n.t('immersiveError')}</h3>
        <p>${i18n.t('immersiveErrorDesc')}</p>
        <button class="btn btn-primary" onclick="history.back()">${i18n.t('returnBtn')}</button>
      `;
      page.appendChild(errorEl);
    }
  }

  showError(msg) {
    if (this._errorTimeout) clearTimeout(this._errorTimeout);
    this.errorToast.textContent = msg;
    this.errorToast.style.display = 'block';
    this.errorToast.classList.add('error-show');
    this._errorTimeout = setTimeout(() => {
      this.errorToast.style.display = 'none';
      this.errorToast.classList.remove('error-show');
    }, 1500);
  }

  destroy() {
    if (this._langUnsub) this._langUnsub();
    if (this.engine) this.engine.destroy();
    this.engine = null;
    if (this.compass) this.compass.dispose();
    this.compass = null;
    if (this.proximityIndicator) this.proximityIndicator.dispose();
    this.proximityIndicator = null;
    if (this._resizeObserver) this._resizeObserver.disconnect();
  }
}
