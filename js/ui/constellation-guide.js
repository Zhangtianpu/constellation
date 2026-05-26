import { i18n } from '../utils/i18n.js';

export class ConstellationGuidePage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this._langUnsub = null;
  }

  render() {
    if (this._langUnsub) this._langUnsub();
    this.container.innerHTML = '';

    const state = this.store.getState();
    const data = state.constellationData;

    const page = document.createElement('div');
    page.className = 'page info-page';

    const header = document.createElement('div');
    header.className = 'info-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-back';
    backBtn.textContent = i18n.t('back');
    backBtn.addEventListener('click', () => this.store.navigate('home'));
    header.appendChild(backBtn);
    const title = document.createElement('h2');
    title.className = 'info-title';
    title.textContent = i18n.t('constellationGuide');
    header.appendChild(title);
    page.appendChild(header);

    const content = document.createElement('article');
    content.className = 'info-content';
    content.innerHTML = `<p class="guide-intro">${i18n.t('guideIntro')}</p>`;

    if (data) {
      for (const season of data.seasons) {
        const seasonSection = document.createElement('section');
        seasonSection.className = 'guide-season';

        const seasonTitle = document.createElement('h2');
        seasonTitle.className = 'guide-season-title';
        seasonTitle.innerHTML = `<span class="season-icon">${season.icon}</span> ${i18n.getSeasonName(data.seasons.indexOf(season))}`;
        seasonSection.appendChild(seasonTitle);

        for (const c of season.constellations) {
          const card = document.createElement('div');
          card.className = 'guide-constellation-card glass-panel';

          const starNames = (c.stars || []).slice(0, 4).map(s => {
            const name = i18n.lang === 'zh' ? s.name : (s.nameEn || s.name);
            return name;
          }).join(', ');

          card.innerHTML = `
            <div class="guide-card-header">
              <h3>${i18n.constellationName(c)}</h3>
              <span class="guide-card-en">${c.nameEn}</span>
              <span class="guide-card-diff">${i18n.t(c.difficulty || 'medium')}</span>
            </div>
            <p class="guide-card-desc">${i18n.constellationDesc(c)}</p>
            <div class="guide-card-details">
              <div class="guide-detail"><strong>${i18n.t('keyStars')}:</strong> ${starNames}</div>
              <div class="guide-detail"><strong>${i18n.t('bestViewingTime')}:</strong> ${i18n.getSeasonName(data.seasons.indexOf(season))}</div>
            </div>
            <div class="guide-card-myth">
              <strong>${i18n.t('mythology')}:</strong> ${i18n.constellationStory(c)}
            </div>
            <button class="btn btn-primary guide-play-btn" data-season="${data.seasons.indexOf(season)}" data-level="${season.constellations.indexOf(c)}">${i18n.t('playGame')}</button>
          `;

          const playBtn = card.querySelector('.guide-play-btn');
          playBtn.addEventListener('click', () => {
            const gameMode = this.store.getState().gameMode || 'classic';
            this.store.setState({
              gameMode,
              currentSeason: parseInt(playBtn.dataset.season),
              currentLevel: parseInt(playBtn.dataset.level),
            });
            const targetPage = gameMode === 'immersive' ? 'immersiveGameplay' : 'gameplay';
            this.store.navigate(targetPage, {
              currentSeason: parseInt(playBtn.dataset.season),
              currentLevel: parseInt(playBtn.dataset.level),
            });
          });

          seasonSection.appendChild(card);
        }

        content.appendChild(seasonSection);
      }
    }

    page.appendChild(content);
    this.container.appendChild(page);

    this._langUnsub = i18n.onLangChange(() => this.render());
  }

  destroy() {
    if (this._langUnsub) this._langUnsub();
  }
}
