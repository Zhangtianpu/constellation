import { CanvasRenderer } from '../renderer/canvas.js';
import { GameEngine } from '../game/engine.js';
import { audioManager } from '../utils/audio.js';

export class GameplayPage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this.renderer = null;
    this.engine = null;
    this.canvas = null;
    this.uiOverlay = null;
    this.hintText = null;
    this.errorToast = null;
    this.errorTimeout = null;
  }

  render() {
    this.container.innerHTML = '';

    const state = this.store.getState();
    const data = state.constellationData;
    if (!data) return;

    const seasonIdx = state.currentSeason ?? 0;
    const constIdx = state.currentLevel ?? 0;
    const constellation = data.seasons[seasonIdx]?.constellations[constIdx];
    if (!constellation) return;

    const page = document.createElement('div');
    page.className = 'page gameplay-page';

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';
    page.appendChild(canvasContainer);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-canvas';
    canvasContainer.appendChild(this.canvas);

    this.uiOverlay = document.createElement('div');
    this.uiOverlay.className = 'game-ui-overlay';

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
    nameEl.innerHTML = `<span class="name-cn">${constellation.name}</span><span class="name-en">${constellation.nameEn}</span><span class="name-sep">·</span><span class="name-desc">${constellation.description}</span>`;
    topBar.appendChild(nameEl);

    const timerEl = document.createElement('div');
    timerEl.className = 'game-timer';
    timerEl.textContent = '0:00';
    topBar.appendChild(timerEl);

    this.uiOverlay.appendChild(topBar);

    const bottomBar = document.createElement('div');
    bottomBar.className = 'game-bottom-bar';

    const hintBtn = document.createElement('button');
    hintBtn.className = 'btn btn-action glass-panel';
    hintBtn.innerHTML = '<span class="btn-icon">💡</span><span class="btn-label">提示</span>';
    hintBtn.addEventListener('click', () => {
      const hint = this.engine.useHint();
      if (hint) {
        this.showHint(hint.type === 'start'
          ? '从高亮的星星开始连线'
          : '连接到高亮的星星');
      }
    });
    bottomBar.appendChild(hintBtn);

    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn btn-action glass-panel';
    undoBtn.innerHTML = '<span class="btn-icon">↩</span><span class="btn-label">撤销</span>';
    undoBtn.addEventListener('click', () => {
      this.engine.undo();
    });
    bottomBar.appendChild(undoBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-action glass-panel';
    resetBtn.innerHTML = '<span class="btn-icon">🔄</span><span class="btn-label">重置</span>';
    resetBtn.addEventListener('click', () => {
      this.engine.stop();
      this.engine.start(constellation);
    });
    bottomBar.appendChild(resetBtn);

    this.uiOverlay.appendChild(bottomBar);

    this.hintText = document.createElement('div');
    this.hintText.className = 'hint-text';
    this.hintText.style.display = 'none';
    this.uiOverlay.appendChild(this.hintText);

    this.errorToast = document.createElement('div');
    this.errorToast.className = 'error-toast';
    this.errorToast.style.display = 'none';
    this.uiOverlay.appendChild(this.errorToast);

    page.appendChild(this.uiOverlay);
    this.container.appendChild(page);

    requestAnimationFrame(() => {
      this.renderer = new CanvasRenderer(this.canvas);
      this.engine = new GameEngine(this.renderer, this.store);

      this.engine.onTimerUpdate = (elapsed) => {
        timerEl.textContent = this.engine.formatTime(elapsed);
      };

      this.engine.onError = (msg) => {
        this.showError(msg);
      };

      this.engine.onComplete = (result) => {
        this.store.navigate('result', {
          lastResult: result,
          currentSeason: seasonIdx,
          currentLevel: constIdx,
        });
      };

      this.engine.start(constellation);
      this.renderer.start();

      this.canvas.addEventListener('click', (e) => this.handleClick(e));
      this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
      this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
      this.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.engine.undo();
      });
    });
  }

  handleClick(e) {
    if (!this.renderer || !this.engine) return;
    const star = this.renderer.getHitStar(e.clientX, e.clientY);
    if (star) {
      this.engine.handleStarClick(star);
    }
  }

  handleTouch(e) {
    e.preventDefault();
    if (!this.renderer || !this.engine) return;
    const touch = e.touches[0];
    const star = this.renderer.getHitStar(touch.clientX, touch.clientY);
    if (star) {
      this.engine.handleStarClick(star);
    }
  }

  handleHover(e) {
    if (!this.renderer) return;
    const star = this.renderer.getHitStar(e.clientX, e.clientY);
    for (const s of this.renderer.stars) {
      s.hovered = false;
    }
    if (star) {
      star.hovered = true;
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  showHint(text) {
    this.hintText.textContent = text;
    this.hintText.style.display = 'block';
    this.hintText.classList.add('hint-show');
    setTimeout(() => {
      this.hintText.style.display = 'none';
      this.hintText.classList.remove('hint-show');
    }, 2500);
  }

  showError(msg) {
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorToast.textContent = msg;
    this.errorToast.style.display = 'block';
    this.errorToast.classList.add('error-show');
    this.errorTimeout = setTimeout(() => {
      this.errorToast.style.display = 'none';
      this.errorToast.classList.remove('error-show');
    }, 1500);
  }

  destroy() {
    if (this.engine) this.engine.destroy();
    if (this.renderer) this.renderer.stop();
    this.renderer = null;
    this.engine = null;
  }
}
