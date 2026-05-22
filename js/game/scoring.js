export class ScoringSystem {
  constructor() {
    this.baseScore = 1000;
    this.hintPenalty = 100;
    this.undoPenalty = 50;
    this.speedBonusThreshold = 30;
    this.speedBonusMax = 500;
  }

  calculate(timeSeconds, hintsUsed, undoCount, difficulty) {
    const diffMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1;

    let score = this.baseScore * diffMultiplier;
    score -= hintsUsed * this.hintPenalty;
    score -= undoCount * this.undoPenalty;

    if (timeSeconds < this.speedBonusThreshold) {
      const speedRatio = 1 - timeSeconds / this.speedBonusThreshold;
      score += this.speedBonusMax * speedRatio;
    }

    score = Math.max(0, Math.round(score));

    const stars = this.getStars(score, difficulty);

    return { score, stars };
  }

  getStars(score, difficulty) {
    const diffMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1;
    const maxScore = (this.baseScore + this.speedBonusMax) * diffMultiplier;
    const ratio = score / maxScore;

    if (ratio >= 0.8) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  }
}
