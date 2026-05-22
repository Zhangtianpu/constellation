import { saveGame, loadGame } from './utils/storage.js';

class Store {
  constructor() {
    this.state = {
      currentPage: 'home',
      gameMode: 'classic',
      currentSeason: null,
      currentLevel: null,
      score: 0,
      hintsUsed: 0,
      undoCount: 0,
      timer: 0,
      completedLevels: {},
      achievements: [],
      constellationData: null,
      immersiveSupported: false,
    };
    this.listeners = [];
  }

  setState(partial) {
    const prev = { ...this.state };
    Object.assign(this.state, partial);
    this.notify(prev);
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(prev) {
    for (const listener of this.listeners) {
      listener(this.state, prev);
    }
  }

  navigate(page, extra = {}) {
    this.setState({ currentPage: page, ...extra });
  }

  setConstellationData(data) {
    this.setState({ constellationData: data });
  }

  completeLevel(levelId, stars, score) {
    const completed = { ...this.state.completedLevels };
    const existing = completed[levelId];
    if (!existing || existing.stars < stars) {
      completed[levelId] = { stars, score: Math.max(existing?.score || 0, score) };
    }
    this.setState({ completedLevels: completed });
    this.persist();
  }

  isLevelCompleted(levelId) {
    return !!this.state.completedLevels[levelId];
  }

  getLevelStars(levelId) {
    return this.state.completedLevels[levelId]?.stars || 0;
  }

  isLevelUnlocked(seasonIndex, constellationIndex) {
    if (seasonIndex === 0 && constellationIndex === 0) return true;
    const data = this.state.constellationData;
    if (!data) return false;

    const prevSeasonIdx = constellationIndex === 0 ? seasonIndex - 1 : seasonIndex;
    const prevConstIdx = constellationIndex === 0
      ? data.seasons[seasonIndex - 1].constellations.length - 1
      : constellationIndex - 1;

    const prevSeason = data.seasons[prevSeasonIdx];
    if (!prevSeason) return false;
    const prevConst = prevSeason.constellations[prevConstIdx];
    if (!prevConst) return false;

    return this.isLevelCompleted(prevConst.id);
  }

  unlockAchievement(achievementId) {
    if (this.state.achievements.includes(achievementId)) return false;
    const achievements = [...this.state.achievements, achievementId];
    this.setState({ achievements });
    this.persist();
    return true;
  }

  persist() {
    saveGame({
      completedLevels: this.state.completedLevels,
      achievements: this.state.achievements,
    });
  }

  restore() {
    const data = loadGame();
    if (data) {
      this.setState({
        completedLevels: data.completedLevels || {},
        achievements: data.achievements || [],
      });
    }
  }

  reset() {
    this.setState({
      completedLevels: {},
      achievements: [],
    });
    this.persist();
  }
}

export const store = new Store();
