import { audioManager } from '../utils/audio.js';
import { isWebGLSupported } from '../utils/webgl-detect.js';
import { i18n } from '../utils/i18n.js';

export class HomePage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
  }

  render() {
    i18n.onLangChange(() => this.render());
    this.container.innerHTML = '';

    const immersiveOk = isWebGLSupported();
    this.store.setState({ immersiveSupported: immersiveOk });

    const page = document.createElement('div');
    page.className = 'page home-page';

    const starsDecoration = document.createElement('div');
    starsDecoration.className = 'home-stars-decoration';
    page.appendChild(starsDecoration);

    const langBtn = document.createElement('button');
    langBtn.className = 'lang-toggle-btn';
    langBtn.textContent = i18n.t('langToggle');
    langBtn.addEventListener('click', () => {
      i18n.toggleLang();
    });
    page.appendChild(langBtn);

    const title = document.createElement('div');
    title.className = 'home-title';
    title.innerHTML = `
      <div class="title-star">✦</div>
      <h1>${i18n.t('appTitle')}</h1>
      <p class="subtitle">Starlight Constellation</p>
      <div class="title-star">✦</div>
    `;
    page.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'home-desc';
    desc.textContent = i18n.t('appDesc');
    page.appendChild(desc);

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

    page.appendChild(buttons);

    const footer = document.createElement('div');
    footer.className = 'home-footer';
    footer.innerHTML = `<p>${i18n.t('homeSubtitle')}</p>`;
    page.appendChild(footer);

    this.container.appendChild(page);
  }

  destroy() {}
}
