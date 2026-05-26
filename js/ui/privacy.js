import { i18n } from '../utils/i18n.js';

export class PrivacyPage {
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
    title.textContent = i18n.t('privacy');
    header.appendChild(title);
    page.appendChild(header);

    const content = document.createElement('article');
    content.className = 'info-content';
    content.innerHTML = `
      <section class="info-section">
        <h2>Introduction</h2>
        <p>Starlight Constellation ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website at constellation.sidehustle.top.</p>
      </section>
      <section class="info-section">
        <h2>Information We Collect</h2>
        <h3>Automatically Collected Information</h3>
        <ul class="info-list">
          <li>Game progress and achievements (stored locally in your browser)</li>
          <li>Language preference</li>
          <li>Anonymous usage statistics via Google Analytics</li>
        </ul>
        <h3>Information You Provide</h3>
        <p>We do not require users to create accounts or provide personal information to play the game.</p>
      </section>
      <section class="info-section">
        <h2>Cookies and Tracking</h2>
        <p>We use cookies for:</p>
        <ul class="info-list">
          <li>Storing game progress and preferences</li>
          <li>Google Analytics for understanding how visitors use our site</li>
          <li>Google AdSense for displaying advertisements</li>
        </ul>
      </section>
      <section class="info-section">
        <h2>Third-Party Services</h2>
        <ul class="info-list">
          <li><strong>Google Analytics</strong>: We use Google Analytics to analyze website traffic. For more information, see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google's Privacy Policy</a>.</li>
          <li><strong>Google AdSense</strong>: We display advertisements through Google AdSense. Google may use cookies to serve ads based on your prior visits to our website or other websites.</li>
        </ul>
      </section>
      <section class="info-section">
        <h2>Data Security</h2>
        <p>Game data is stored locally on your device. We do not store personal data on our servers.</p>
      </section>
      <section class="info-section">
        <h2>Your Rights</h2>
        <ul class="info-list">
          <li>Clear your game progress by clearing browser data</li>
          <li>Opt out of Google Analytics using the browser extension</li>
          <li>Disable cookies in your browser settings</li>
        </ul>
      </section>
      <section class="info-section">
        <h2>${i18n.t('contact')}</h2>
        <p>${i18n.t('contactEmail')}</p>
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
