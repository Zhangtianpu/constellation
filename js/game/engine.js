import { ConstellationChecker } from './constellation.js';
import { ScoringSystem } from './scoring.js';
import { AchievementSystem } from './achievement.js';
import { audioManager } from '../utils/audio.js';
import { normalizeEdge } from '../utils/math.js';

export class GameEngine {
  constructor(renderer, store) {
    this.renderer = renderer;
    this.store = store;
    this.scoring = new ScoringSystem();
    this.achievementSystem = new AchievementSystem(store);

    this.constellationData = null;
    this.checker = null;
    this.userEdges = [];
    this.connectedStarIds = new Set();
    this.currentStarId = null;
    this.hintsUsed = 0;
    this.undoCount = 0;
    this.startTime = 0;
    this.elapsed = 0;
    this.timerInterval = null;
    this.completed = false;
    this.destroyed = false;
    this.onComplete = null;
    this.onError = null;
    this.onTimerUpdate = null;
  }

  start(constellationData) {
    this.constellationData = constellationData;
    this.checker = new ConstellationChecker(constellationData);
    this.userEdges = [];
    this.connectedStarIds = new Set();
    this.currentStarId = null;
    this.hintsUsed = 0;
    this.undoCount = 0;
    this.completed = false;
    this.destroyed = false;
    this.elapsed = 0;

    this.renderer.setConstellation(constellationData);
    this.renderer.lines = [];
    this.startTime = Date.now();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.completed) {
        this.elapsed = (Date.now() - this.startTime) / 1000;
        if (this.onTimerUpdate) this.onTimerUpdate(this.elapsed);
      }
    }, 100);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  destroy() {
    this.destroyed = true;
    this.stop();
  }

  handleStarClick(star) {
    if (this.completed || !star.isConstellation) return;

    if (this.currentStarId === null) {
      this.currentStarId = star.starId;
      star.selected = true;
      this.connectedStarIds.add(star.starId);
      audioManager.playClick();
      return;
    }

    if (star.starId === this.currentStarId) {
      const prevStar = this.renderer.getConstellationStar(this.currentStarId);
      if (prevStar) prevStar.selected = false;
      if (!this.userEdges.some(e => e.from === star.starId || e.to === star.starId)) {
        this.connectedStarIds.delete(star.starId);
      }
      this.currentStarId = null;
      return;
    }

    if (this.connectedStarIds.has(star.starId)) {
      const fromId = this.currentStarId;
      const toId = star.starId;

      const edgeKey = normalizeEdge(fromId, toId);
      const edgeExists = this.userEdges.some(e => normalizeEdge(e.from, e.to) === edgeKey);

      if (edgeExists) {
        this.switchCurrentStar(star);
        return;
      }

      if (this.checker.isEdgeValid(fromId, toId)) {
        this.addEdge(fromId, toId);
        audioManager.playConnect();
        this.checkCompletion();
      } else {
        this.switchCurrentStar(star);
      }
      return;
    }

    const fromId = this.currentStarId;
    const toId = star.starId;

    if (this.checker.isEdgeValid(fromId, toId)) {
      this.addEdge(fromId, toId);
      audioManager.playConnect();
      this.checkCompletion();
    } else {
      this.addErrorLine(fromId, toId);
      audioManager.playError();
      if (this.onError) this.onError('这些星星之间没有连线哦，再试试吧！');
    }
  }

  switchCurrentStar(star) {
    const prevStar = this.renderer.getConstellationStar(this.currentStarId);
    if (prevStar) prevStar.selected = false;
    this.currentStarId = star.starId;
    star.selected = true;
    audioManager.playClick();
  }

  addEdge(fromId, toId) {
    this.userEdges.push({ from: fromId, to: toId });
    this.connectedStarIds.add(fromId);
    this.connectedStarIds.add(toId);

    const fromStar = this.renderer.getConstellationStar(fromId);
    const toStar = this.renderer.getConstellationStar(toId);

    if (fromStar) fromStar.selected = false;
    if (toStar) toStar.selected = true;

    this.currentStarId = toId;

    if (fromStar && toStar) {
      this.renderer.addLine(fromStar, toStar);
    }
  }

  addErrorLine(fromId, toId) {
    const fromStar = this.renderer.getConstellationStar(fromId);
    const toStar = this.renderer.getConstellationStar(toId);

    if (fromStar && toStar) {
      const line = this.renderer.addLine(fromStar, toStar);
      line.error = true;
    }
  }

  undo() {
    if (this.userEdges.length === 0 || this.completed) return;

    const lastEdge = this.userEdges.pop();
    this.undoCount++;

    this.renderer.removeLastLine();

    this.connectedStarIds.clear();
    if (this.userEdges.length === 0) {
      this.connectedStarIds.add(lastEdge.from);
    } else {
      for (const edge of this.userEdges) {
        this.connectedStarIds.add(edge.from);
        this.connectedStarIds.add(edge.to);
      }
    }

    const prevStar = this.renderer.getConstellationStar(this.currentStarId);
    if (prevStar) prevStar.selected = false;

    this.currentStarId = lastEdge.from;
    const fromStar = this.renderer.getConstellationStar(lastEdge.from);
    if (fromStar) fromStar.selected = true;

    audioManager.playClick();
  }

  useHint() {
    if (this.completed) return;

    const hint = this.checker.getNextHint(this.userEdges, this.connectedStarIds);
    if (!hint) return;

    this.hintsUsed++;
    audioManager.playHint();

    if (hint.type === 'start') {
      const star = this.renderer.getConstellationStar(hint.starId);
      if (star) {
        star.highlighted = true;
        setTimeout(() => { star.highlighted = false; }, 2000);
      }
    } else if (hint.type === 'connect') {
      const toStar = this.renderer.getConstellationStar(hint.toId);
      if (toStar) {
        toStar.highlighted = true;
        setTimeout(() => { toStar.highlighted = false; }, 2000);
      }
    }

    return hint;
  }

  checkCompletion() {
    const result = this.checker.check(this.userEdges);
    if (result.correct) {
      this.completed = true;
      this.stop();

      for (const star of this.renderer.stars) {
        if (star.isConstellation) star.completed = true;
      }
      for (const line of this.renderer.lines) {
        line.fromStar.completed = true;
        line.toStar.completed = true;
      }

      const centerX = this.renderer.stars
        .filter(s => s.isConstellation)
        .reduce((sum, s) => sum + s.screenX, 0) / this.constellationData.stars.length;
      const centerY = this.renderer.stars
        .filter(s => s.isConstellation)
        .reduce((sum, s) => sum + s.screenY, 0) / this.constellationData.stars.length;

      this.renderer.emitCelebration(centerX, centerY);
      audioManager.playComplete();

      const { score, stars } = this.scoring.calculate(
        this.elapsed,
        this.hintsUsed,
        this.undoCount,
        this.constellationData.difficulty
      );

      this.store.completeLevel(this.constellationData.id, stars, score);

      const completedCount = Object.keys(this.store.getState().completedLevels).length;
      const achievementStats = {
        completedCount,
        perfectClear: this.hintsUsed === 0,
        fastClear: this.elapsed < 30,
        allSeasons: this.checkAllSeasons(),
      };
      const newAchievements = this.achievementSystem.checkAll(achievementStats);

      if (this.onComplete) {
        setTimeout(() => {
          if (this.destroyed) return;
          this.onComplete({
            score,
            stars,
            time: this.elapsed,
            hintsUsed: this.hintsUsed,
            undoCount: this.undoCount,
            newAchievements,
          });
        }, 1500);
      }
    }
  }

  checkAllSeasons() {
    const data = this.store.getState().constellationData;
    if (!data) return false;
    for (const season of data.seasons) {
      const allDone = season.constellations.every(c =>
        this.store.isLevelCompleted(c.id)
      );
      if (!allDone) return false;
    }
    return true;
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
