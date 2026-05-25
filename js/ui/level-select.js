import { audioManager } from '../utils/audio.js';
import { isWebGLSupported } from '../utils/webgl-detect.js';
import { i18n } from '../utils/i18n.js';

export class LevelSelectPage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this._langUnsub = null;
  }

  render() {
    if (this._langUnsub) {
      this._langUnsub();
    }
    this._langUnsub = i18n.onLangChange(() => this.render());
    this.container.innerHTML = '';

    const state = this.store.getState();
    const gameMode = state.gameMode || 'classic';
    const immersiveOk = isWebGLSupported();

    const page = document.createElement('div');
    page.className = 'page level-select-page';

    const header = document.createElement('div');
    header.className = 'level-header';

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-back';
    backBtn.textContent = i18n.t('back');
    backBtn.addEventListener('click', () => {
      audioManager.playClick();
      this.store.navigate('home');
    });
    header.appendChild(backBtn);

    const title = document.createElement('h2');
    title.className = 'level-title';
    title.textContent = i18n.t('selectConstellation');
    header.appendChild(title);

    const modeToggle = document.createElement('div');
    modeToggle.className = 'mode-toggle';

    const classicTab = document.createElement('button');
    classicTab.className = `mode-tab ${gameMode === 'classic' ? 'active' : ''}`;
    classicTab.textContent = '✨ ' + i18n.t('classicMode');
    classicTab.addEventListener('click', () => {
      audioManager.playClick();
      this.store.setState({ gameMode: 'classic' });
      this.render();
    });
    modeToggle.appendChild(classicTab);

    if (immersiveOk) {
      const immersiveTab = document.createElement('button');
      immersiveTab.className = `mode-tab ${gameMode === 'immersive' ? 'active' : ''}`;
      immersiveTab.textContent = '🌌 ' + i18n.t('immersiveMode');
      immersiveTab.addEventListener('click', () => {
        audioManager.playClick();
        this.store.setState({ gameMode: 'immersive' });
        this.render();
      });
      modeToggle.appendChild(immersiveTab);
    }

    header.appendChild(modeToggle);
    page.appendChild(header);

    const data = state.constellationData;
    if (!data) return;

    const seasonGrid = document.createElement('div');
    seasonGrid.className = 'season-grid';

    data.seasons.forEach((season, seasonIdx) => {
      const seasonCard = document.createElement('div');
      seasonCard.className = 'season-card';

      const seasonHeader = document.createElement('div');
      seasonHeader.className = 'season-header';
      seasonHeader.innerHTML = `
        <span class="season-icon">${season.icon}</span>
        <span class="season-name">${i18n.getSeasonName(seasonIdx)}</span>
      `;
      seasonCard.appendChild(seasonHeader);

      const constGrid = document.createElement('div');
      constGrid.className = 'constellation-grid';

      season.constellations.forEach((constellation, constIdx) => {
        const isUnlocked = this.store.isLevelUnlocked(seasonIdx, constIdx);
        const isCompleted = this.store.isLevelCompleted(constellation.id);
        const stars = this.store.getLevelStars(constellation.id);

        const card = document.createElement('div');
        card.className = `constellation-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`;

        const diffLabel = { easy: i18n.t('easy'), medium: i18n.t('medium'), hard: i18n.t('hard') }[constellation.difficulty] || '';

        card.innerHTML = `
          <div class="card-icon">${isUnlocked ? (isCompleted ? '⭐' : '✦') : '🔒'}</div>
          <div class="card-name">${isUnlocked ? i18n.constellationName(constellation) : '???'}</div>
          <div class="card-difficulty">${isUnlocked ? diffLabel : ''}</div>
          <div class="card-stars">${isCompleted ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : ''}</div>
        `;

        if (isUnlocked) {
          card.addEventListener('click', () => {
            audioManager.playClick();
            const targetPage = gameMode === 'immersive' ? 'immersiveGameplay' : 'gameplay';
            this.store.navigate(targetPage, {
              currentSeason: seasonIdx,
              currentLevel: constIdx,
            });
          });
        }

        constGrid.appendChild(card);
      });

      seasonCard.appendChild(constGrid);
      seasonGrid.appendChild(seasonCard);
    });

    page.appendChild(seasonGrid);
    this.container.appendChild(page);
  }

  destroy() {
    if (this._langUnsub) this._langUnsub();
  }
}
