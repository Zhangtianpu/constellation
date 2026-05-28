import { audioManager } from '../utils/audio.js';
import { isWebGLSupported } from '../utils/webgl-detect.js';
import { i18n } from '../utils/i18n.js';

export class HomePage {
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

    const immersiveOk = isWebGLSupported();
    this.store.setState({ immersiveSupported: immersiveOk });

    const page = document.createElement('div');
    page.className = 'page home-page';
    page.style.overflowY = 'auto';

    const topSection = document.createElement('div');
    topSection.className = 'home-top-section';

    const starsDecoration = document.createElement('div');
    starsDecoration.className = 'home-stars-decoration';
    topSection.appendChild(starsDecoration);

    const langBtn = document.createElement('button');
    langBtn.className = 'lang-toggle-btn';
    langBtn.textContent = i18n.t('langToggle');
    langBtn.addEventListener('click', () => {
      i18n.toggleLang();
    });
    topSection.appendChild(langBtn);

    const title = document.createElement('div');
    title.className = 'home-title';
    title.innerHTML = `
      <div class="title-star">✦</div>
      <h1>${i18n.t('appTitle')}</h1>
      <p class="subtitle">Constellation Game</p>
      <div class="title-star">✦</div>
    `;
    topSection.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'home-desc';
    desc.textContent = i18n.t('appDesc');
    topSection.appendChild(desc);

    const buttons = document.createElement('div');
    buttons.className = 'home-buttons';

    const classicBtn = document.createElement('button');
    classicBtn.className = 'btn btn-primary btn-glow';
    classicBtn.innerHTML = `<span class="mode-emoji">✨</span><span>${i18n.t('classicMode')}</span><span class="mode-sub">${i18n.t('classicSub')}</span>`;
    classicBtn.addEventListener('click', () => {
      audioManager.init();
      audioManager.playClick();
      this.store.setState({ gameMode: 'classic' });
      this.store.navigate('levelSelect');
    });
    buttons.appendChild(classicBtn);

    if (immersiveOk) {
      const immersiveBtn = document.createElement('button');
      immersiveBtn.className = 'btn btn-immersive btn-glow';
      immersiveBtn.innerHTML = `<span class="mode-emoji">🌌</span><span>${i18n.t('immersiveMode')}</span><span class="mode-sub">${i18n.t('immersiveSub')}</span>`;
      immersiveBtn.addEventListener('click', () => {
        audioManager.init();
        audioManager.playClick();
        this.store.setState({ gameMode: 'immersive' });
        this.store.navigate('levelSelect');
      });
      buttons.appendChild(immersiveBtn);
    }

    const soundBtn = document.createElement('button');
    soundBtn.className = 'btn btn-icon';
    soundBtn.textContent = '🔊';
    soundBtn.addEventListener('click', () => {
      audioManager.init();
      const enabled = audioManager.toggle();
      soundBtn.textContent = enabled ? '🔊' : '🔇';
    });
    buttons.appendChild(soundBtn);

    topSection.appendChild(buttons);
    page.appendChild(topSection);

    const scrollContent = document.createElement('div');
    scrollContent.className = 'home-scroll-content';

    const exploreSection = document.createElement('section');
    exploreSection.className = 'home-explore';
    exploreSection.innerHTML = `
      <h2 class="section-title">${i18n.t('exploreSky')}</h2>
      <p class="section-desc">${i18n.t('exploreSkyDesc')}</p>
    `;
    scrollContent.appendChild(exploreSection);

    const featuresSection = document.createElement('section');
    featuresSection.className = 'home-features';
    featuresSection.innerHTML = `
      <h2 class="section-title">${i18n.t('features')}</h2>
      <div class="features-grid">
        <div class="feature-card glass-panel">
          <div class="feature-icon">🌟</div>
          <h3>${i18n.t('featureClassic')}</h3>
          <p>${i18n.t('featureClassicDesc')}</p>
        </div>
        <div class="feature-card glass-panel">
          <div class="feature-icon">🌌</div>
          <h3>${i18n.t('featureImmersive')}</h3>
          <p>${i18n.t('featureImmersiveDesc')}</p>
        </div>
        <div class="feature-card glass-panel">
          <div class="feature-icon">📖</div>
          <h3>${i18n.t('featureStories')}</h3>
          <p>${i18n.t('featureStoriesDesc')}</p>
        </div>
        <div class="feature-card glass-panel">
          <div class="feature-icon">🏆</div>
          <h3>${i18n.t('featureAchievements')}</h3>
          <p>${i18n.t('featureAchievementsDesc')}</p>
        </div>
      </div>
    `;
    scrollContent.appendChild(featuresSection);

    const constSection = document.createElement('section');
    constSection.className = 'home-constellations';
    let constCardsHTML = '';
    const data = this.store.getState().constellationData;
    if (data) {
      for (const season of data.seasons) {
        for (const c of season.constellations) {
          constCardsHTML += `
            <div class="const-preview-card">
              <span class="const-preview-icon">${season.icon}</span>
              <span class="const-preview-name">${i18n.constellationName(c)}</span>
              <span class="const-preview-en">${c.nameEn}</span>
            </div>
          `;
        }
      }
    }
    constSection.innerHTML = `
      <h2 class="section-title">${i18n.t('availableConstellations')}</h2>
      <div class="const-preview-grid">${constCardsHTML}</div>
    `;
    scrollContent.appendChild(constSection);

    const adContainer = document.createElement('div');
    adContainer.className = 'ad-container';
    adContainer.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2532162099328025" data-ad-slot="XXXXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    scrollContent.appendChild(adContainer);

    page.appendChild(scrollContent);

    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    footer.innerHTML = `
      <div class="footer-content">
        <div class="footer-section">
          <h3>Starlight Constellation</h3>
          <p>${i18n.t('appDesc')}</p>
        </div>
        <div class="footer-section">
          <h3>${i18n.t('footerQuickLinks')}</h3>
          <ul>
            <li><a href="#" data-page="about">${i18n.t('about')}</a></li>
            <li><a href="#" data-page="howToPlay">${i18n.t('howToPlay')}</a></li>
            <li><a href="#" data-page="constellationGuide">${i18n.t('constellationGuide')}</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>${i18n.t('footerLegal')}</h3>
          <ul>
            <li><a href="#" data-page="privacy">${i18n.t('privacy')}</a></li>
            <li><a href="#" data-page="terms">${i18n.t('terms')}</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>${i18n.t('contact')}</h3>
          <p>${i18n.t('contactEmail')}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${i18n.t('footerCopyright')}</p>
      </div>
    `;

    footer.querySelectorAll('a[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.store.navigate(link.dataset.page);
      });
    });

    page.appendChild(footer);

    this.container.appendChild(page);
  }

  destroy() {
    if (this._langUnsub) {
      this._langUnsub();
      this._langUnsub = null;
    }
  }
}
