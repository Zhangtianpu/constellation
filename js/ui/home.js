import { audioManager } from '../utils/audio.js';
import { isWebGLSupported } from '../utils/webgl-detect.js';

export class HomePage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
  }

  render() {
    this.container.innerHTML = '';

    const immersiveOk = isWebGLSupported();
    this.store.setState({ immersiveSupported: immersiveOk });

    const page = document.createElement('div');
    page.className = 'page home-page';

    const starsDecoration = document.createElement('div');
    starsDecoration.className = 'home-stars-decoration';
    page.appendChild(starsDecoration);

    const title = document.createElement('div');
    title.className = 'home-title';
    title.innerHTML = `
      <div class="title-star">✦</div>
      <h1>星光星座</h1>
      <p class="subtitle">Starlight Constellation</p>
      <div class="title-star">✦</div>
    `;
    page.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'home-desc';
    desc.textContent = '在璀璨星空中，找到属于你的星座';
    page.appendChild(desc);

    const buttons = document.createElement('div');
    buttons.className = 'home-buttons';

    const classicBtn = document.createElement('button');
    classicBtn.className = 'btn btn-primary btn-glow';
    classicBtn.innerHTML = '<span class="mode-emoji">✨</span><span>经典模式</span><span class="mode-sub">星座连线</span>';
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
      immersiveBtn.innerHTML = '<span class="mode-emoji">🌌</span><span>沉浸模式</span><span class="mode-sub">星空探索</span>';
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
    footer.innerHTML = '<p>点击星星，连线星座，探索星空的奥秘</p>';
    page.appendChild(footer);

    this.container.appendChild(page);
  }

  destroy() {}
}
