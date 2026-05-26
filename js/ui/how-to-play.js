import { i18n } from '../utils/i18n.js';

export class HowToPlayPage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
    this._langUnsub = null;
  }

  render() {
    if (this._langUnsub) this._langUnsub();
    this.container.innerHTML = '';

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
    title.textContent = i18n.t('howToPlay');
    header.appendChild(title);
    page.appendChild(header);

    const content = document.createElement('article');
    content.className = 'info-content';
    content.innerHTML = `
      <section class="info-section">
        <h2>${i18n.t('howToPlayTitle')}</h2>
        <ol class="info-steps">
          <li>${i18n.t('howToPlayStep1')}</li>
          <li>${i18n.t('howToPlayStep2')}</li>
          <li>${i18n.t('howToPlayStep3')}</li>
          <li>${i18n.t('howToPlayStep4')}</li>
          <li>${i18n.t('howToPlayStep5')}</li>
        </ol>
      </section>
      <section class="info-section">
        <h2>${i18n.t('classicControls')}</h2>
        <ul class="info-list">
          <li><strong>${i18n.t('classicClick')}</strong></li>
          <li><strong>${i18n.t('classicRightClick')}</strong></li>
          <li><strong>${i18n.t('classicHint')}</strong></li>
        </ul>
      </section>
      <section class="info-section">
        <h2>${i18n.t('immersiveControls')}</h2>
        <ul class="info-list">
          <li><strong>${i18n.t('immersiveDrag')}</strong></li>
          <li><strong>${i18n.t('immersiveZoom')}</strong></li>
          <li><strong>${i18n.t('immersiveClick3d')}</strong></li>
        </ul>
      </section>
    `;
    page.appendChild(content);
    this.container.appendChild(page);

    this._langUnsub = i18n.onLangChange(() => this.render());
  }

  destroy() {
    if (this._langUnsub) this._langUnsub();
  }
}
