import { i18n } from '../utils/i18n.js';

export class AboutPage {
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
    title.textContent = i18n.t('about');
    header.appendChild(title);
    page.appendChild(header);

    const content = document.createElement('article');
    content.className = 'info-content';
    content.innerHTML = `
      <section class="info-section">
        <h2>${i18n.t('aboutMission')}</h2>
        <p>${i18n.t('aboutMissionText')}</p>
      </section>
      <section class="info-section">
        <h2>${i18n.t('aboutOffer')}</h2>
        <ul class="info-list">
          <li><strong>${i18n.t('aboutOfferText1').split('—')[0]}</strong> — ${i18n.t('aboutOfferText1').split('—')[1] || ''}</li>
          <li><strong>${i18n.t('aboutOfferText2').split('—')[0]}</strong> — ${i18n.t('aboutOfferText2').split('—')[1] || ''}</li>
          <li><strong>${i18n.t('aboutOfferText3').split('—')[0]}</strong> — ${i18n.t('aboutOfferText3').split('—')[1] || ''}</li>
          <li><strong>${i18n.t('aboutOfferText4').split('—')[0]}</strong> — ${i18n.t('aboutOfferText4').split('—')[1] || ''}</li>
        </ul>
      </section>
      <section class="info-section">
        <h2>${i18n.t('aboutWho')}</h2>
        <ul class="info-list">
          <li>${i18n.t('aboutWhoText1')}</li>
          <li>${i18n.t('aboutWhoText2')}</li>
          <li>${i18n.t('aboutWhoText3')}</li>
          <li>${i18n.t('aboutWhoText4')}</li>
        </ul>
      </section>
      <section class="info-section">
        <h2>${i18n.t('aboutTech')}</h2>
        <p>${i18n.t('aboutTechText')}</p>
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
