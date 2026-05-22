const ACHIEVEMENTS = [
  {
    id: 'first_star',
    name: '初识星空',
    description: '完成第一个星座',
    icon: '⭐',
    check: (stats) => stats.completedCount >= 1,
  },
  {
    id: 'hunter',
    name: '星座猎人',
    description: '完成10个星座',
    icon: '🔭',
    check: (stats) => stats.completedCount >= 10,
  },
  {
    id: 'master',
    name: '星空大师',
    description: '完成所有星座',
    icon: '👑',
    check: (stats) => stats.completedCount >= 16,
  },
  {
    id: 'perfect',
    name: '完美连线',
    description: '不使用提示完成一个星座',
    icon: '✨',
    check: (stats) => stats.perfectClear,
  },
  {
    id: 'lightning',
    name: '闪电之手',
    description: '30秒内完成一个星座',
    icon: '⚡',
    check: (stats) => stats.fastClear,
  },
  {
    id: 'four_seasons',
    name: '四季守望',
    description: '完成所有季节组',
    icon: '🌈',
    check: (stats) => stats.allSeasons,
  },
];

export class AchievementSystem {
  constructor(store) {
    this.store = store;
  }

  checkAll(stats) {
    const newAchievements = [];
    for (const ach of ACHIEVEMENTS) {
      if (ach.check(stats) && this.store.unlockAchievement(ach.id)) {
        newAchievements.push(ach);
      }
    }
    return newAchievements;
  }

  static getAchievements() {
    return ACHIEVEMENTS;
  }

  static getAchievement(id) {
    return ACHIEVEMENTS.find(a => a.id === id);
  }
}
