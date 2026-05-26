import { i18n } from '../utils/i18n.js';

export class TermsPage {
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
    title.textContent = i18n.t('terms');
    header.appendChild(title);
    page.appendChild(header);

    const content = document.createElement('article');
    content.className = 'info-content';
    content.innerHTML = `
      <section class="info-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Starlight Constellation, you accept and agree to be bound by these Terms of Service.</p>
      </section>
      <section class="info-section">
        <h2>2. Use of Service</h2>
        <p>Starlight Constellation is a free educational game. You may use it for personal, non-commercial purposes.</p>
      </section>
      <section class="info-section">
        <h2>3. Intellectual Property</h2>
        <p>All content, including game design, graphics, and text, is owned by Starlight Constellation and protected by copyright laws.</p>
      </section>
      <section class="info-section">
        <h2>4. Disclaimer</h2>
        <p>The game is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.</p>
      </section>
      <section class="info-section">
        <h2>5. Limitation of Liability</h2>
        <p>We shall not be liable for any damages arising from your use of this service.</p>
      </section>
      <section class="info-section">
        <h2>6. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>
      </section>
      <section class="info-section">
        <h2>7. Contact</h2>
        <p>Questions? Contact us at: ${i18n.t('contactEmail')}</p>
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
