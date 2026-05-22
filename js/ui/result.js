import { audioManager } from '../utils/audio.js';
import { AchievementSystem } from '../game/achievement.js';

export class ResultPage {
  constructor(container, store) {
    this.container = container;
    this.store = store;
  }

  render() {
    this.container.innerHTML = '';

    const state = this.store.getState();
    const result = state.lastResult;
    const seasonIdx = state.currentSeason ?? 0;
    const constIdx = state.currentLevel ?? 0;
    const data = state.constellationData;
    const constellation = data?.seasons[seasonIdx]?.constellations[constIdx];

    if (!result || !constellation) {
      this.store.navigate('levelSelect');
      return;
    }

    const page = document.createElement('div');
    page.className = 'page result-page';

    const card = document.createElement('div');
    card.className = 'result-card glass-panel';

    const title = document.createElement('div');
    title.className = 'result-title';
    title.innerHTML = `
      <div class="result-constellation-name">${constellation.name}</div>
      <div class="result-constellation-en">${constellation.nameEn}</div>
    `;
    card.appendChild(title);

    const starsEl = document.createElement('div');
    starsEl.className = 'result-stars';
    const starChars = [];
    for (let i = 0; i < 3; i++) {
      starChars.push(i < result.stars ? '★' : '☆');
    }
    starsEl.innerHTML = starChars.map((s, i) =>
      `<span class="result-star ${i < result.stars ? 'filled' : ''}" style="animation-delay: ${i * 0.2}s">${s}</span>`
    ).join('');
    card.appendChild(starsEl);

    const scoreEl = document.createElement('div');
    scoreEl.className = 'result-score';
    scoreEl.innerHTML = `<span class="score-label">得分</span><span class="score-value">${result.score}</span>`;
    card.appendChild(scoreEl);

    const statsEl = document.createElement('div');
    statsEl.className = 'result-stats';
    const m = Math.floor(result.time / 60);
    const s = Math.floor(result.time % 60);
    statsEl.innerHTML = `
      <div class="stat-item"><span class="stat-icon">⏱</span><span class="stat-label">用时</span><span class="stat-value">${m}:${s.toString().padStart(2, '0')}</span></div>
      <div class="stat-item"><span class="stat-icon">💡</span><span class="stat-label">提示</span><span class="stat-value">${result.hintsUsed}次</span></div>
      <div class="stat-item"><span class="stat-icon">↩</span><span class="stat-label">撤销</span><span class="stat-value">${result.undoCount}次</span></div>
    `;
    card.appendChild(statsEl);

    const storyEl = document.createElement('div');
    storyEl.className = 'result-story glass-panel';
    storyEl.innerHTML = `<h3>📖 星座故事</h3><p>${constellation.story}</p>`;
    card.appendChild(storyEl);

    if (result.newAchievements && result.newAchievements.length > 0) {
      const achEl = document.createElement('div');
      achEl.className = 'result-achievements';
      achEl.innerHTML = '<h3>🏆 新成就解锁！</h3>';
      for (const ach of result.newAchievements) {
        const achItem = document.createElement('div');
        achItem.className = 'achievement-item';
        achItem.innerHTML = `<span class="ach-icon">${ach.icon}</span><span class="ach-name">${ach.name}</span><span class="ach-desc">${ach.description}</span>`;
        achEl.appendChild(achItem);
      }
      card.appendChild(achEl);
    }

    const buttons = document.createElement('div');
    buttons.className = 'result-buttons';

    const nextConstIdx = constIdx + 1;
    const season = data.seasons[seasonIdx];
    const hasNext = nextConstIdx < season.constellations.length;
    const hasNextSeason = seasonIdx + 1 < data.seasons.length;
    const gameMode = state.gameMode || 'classic';
    const targetPage = gameMode === 'immersive' ? 'immersiveGameplay' : 'gameplay';

    if (hasNext) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary btn-glow';
      nextBtn.textContent = '✨ 下一关';
      nextBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.store.navigate(targetPage, {
          currentSeason: seasonIdx,
          currentLevel: nextConstIdx,
        });
      });
      buttons.appendChild(nextBtn);
    } else if (hasNextSeason) {
      const nextSeasonBtn = document.createElement('button');
      nextSeasonBtn.className = 'btn btn-primary btn-glow';
      nextSeasonBtn.textContent = '🌟 下一季';
      nextSeasonBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.store.navigate(targetPage, {
          currentSeason: seasonIdx + 1,
          currentLevel: 0,
        });
      });
      buttons.appendChild(nextSeasonBtn);
    }

    const replayBtn = document.createElement('button');
    replayBtn.className = 'btn btn-secondary';
    replayBtn.textContent = '🔄 再玩一次';
    replayBtn.addEventListener('click', () => {
      audioManager.playClick();
      this.store.navigate(targetPage, {
        currentSeason: seasonIdx,
        currentLevel: constIdx,
      });
    });
    buttons.appendChild(replayBtn);

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary';
    backBtn.textContent = '🗺 关卡选择';
    backBtn.addEventListener('click', () => {
      audioManager.playClick();
      this.store.navigate('levelSelect');
    });
    buttons.appendChild(backBtn);

    card.appendChild(buttons);
    page.appendChild(card);
    this.container.appendChild(page);
  }

  destroy() {}
}
