const translations = {
  en: {
    appTitle: 'Starlight Constellation',
    appDesc: 'Find your constellation among the stars',
    homeSubtitle: 'Connect the stars, discover constellations, explore the cosmos',
    classicMode: 'Classic',
    classicSub: 'Constellation Lines',
    immersiveMode: 'Immersive',
    immersiveSub: 'Star Explorer',
    selectConstellation: 'Select Constellation',
    back: '← Back',
    hint: 'Hint',
    undo: 'Undo',
    reset: 'Reset',
    hintStart: 'Start connecting from the highlighted star',
    hintConnect: 'Connect to the highlighted star',
    rotateHint: 'Rotate to find the constellation',
    score: 'Score',
    time: 'Time',
    hints: 'Hints',
    times: 'times',
    undos: 'Undos',
    constellationStory: 'Constellation Story',
    newAchievement: 'New Achievement!',
    nextLevel: '✨ Next',
    nextSeason: '🌟 Next Season',
    replay: '🔄 Replay',
    levelSelect: '🗺 Levels',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    bestViewing: 'Best viewing: ',
    immersiveError: 'Immersive mode failed to load',
    immersiveErrorDesc: 'Your browser may not support WebGL. Please try Classic mode.',
    returnBtn: 'Back',
    spring: 'Spring Sky',
    summer: 'Summer Sky',
    autumn: 'Autumn Sky',
    winter: 'Winter Sky',
    invalidEdge: 'These stars cannot be connected. Try again!',
    langToggle: '中文',
    north: 'N',
    east: 'E',
    south: 'S',
    west: 'W',
    hintRotate: 'Rotate to find the constellation',
    hintShape: 'Look for the pulsing bright stars',
    hintConnect3d: 'Reference lines shown. Click the bright stars to connect',
    achFirstConstellation: 'First Steps',
    achFirstConstellationDesc: 'Complete your first constellation',
    achHunter: 'Constellation Hunter',
    achHunterDesc: 'Complete 10 constellations',
    achMaster: 'Star Master',
    achMasterDesc: 'Complete all constellations',
    achPerfect: 'Perfect Lines',
    achPerfectDesc: 'Complete a constellation without hints',
    achSpeed: 'Lightning Hands',
    achSpeedDesc: 'Complete a constellation in 30 seconds',
    achSeasons: 'Four Seasons',
    achSeasonsDesc: 'Complete all season groups',
  },
  zh: {
    appTitle: '星光星座',
    appDesc: '在璀璨星空中，找到属于你的星座',
    homeSubtitle: '点击星星，连线星座，探索星空的奥秘',
    classicMode: '经典模式',
    classicSub: '星座连线',
    immersiveMode: '沉浸模式',
    immersiveSub: '星空探索',
    selectConstellation: '选择星座',
    back: '← 返回',
    hint: '提示',
    undo: '撤销',
    reset: '重置',
    hintStart: '从高亮的星星开始连线',
    hintConnect: '连接到高亮的星星',
    rotateHint: '旋转视角寻找星座',
    score: '得分',
    time: '用时',
    hints: '提示',
    times: '次',
    undos: '撤销',
    constellationStory: '星座故事',
    newAchievement: '新成就解锁！',
    nextLevel: '✨ 下一关',
    nextSeason: '🌟 下一季',
    replay: '🔄 再玩一次',
    levelSelect: '🗺 关卡选择',
    easy: '初级',
    medium: '中级',
    hard: '高级',
    bestViewing: '最佳观测：',
    immersiveError: '沉浸模式加载失败',
    immersiveErrorDesc: '您的浏览器可能不支持 WebGL，请尝试经典模式',
    returnBtn: '返回',
    spring: '春夜星空',
    summer: '夏夜星空',
    autumn: '秋夜星空',
    winter: '冬夜星空',
    invalidEdge: '这些星星之间没有连线哦，再试试吧！',
    langToggle: 'EN',
    north: '北',
    east: '东',
    south: '南',
    west: '西',
    hintRotate: '旋转视角寻找星座',
    hintShape: '注意脉动的亮星',
    hintConnect3d: '参考连线已显示，点击亮星完成连线',
    achFirstConstellation: '初识星空',
    achFirstConstellationDesc: '完成第一个星座',
    achHunter: '星座猎人',
    achHunterDesc: '完成10个星座',
    achMaster: '星空大师',
    achMasterDesc: '完成所有星座',
    achPerfect: '完美连线',
    achPerfectDesc: '不使用提示完成一个星座',
    achSpeed: '闪电之手',
    achSpeedDesc: '30秒内完成一个星座',
    achSeasons: '四季守望',
    achSeasonsDesc: '完成所有季节组',
  },
};

class I18n {
  constructor() {
    this.lang = 'en';
    this.listeners = [];
    const saved = localStorage.getItem('lang');
    if (saved && translations[saved]) {
      this.lang = saved;
    }
  }

  t(key) {
    return translations[this.lang]?.[key] || translations.en[key] || key;
  }

  setLang(lang) {
    if (lang === this.lang) return;
    this.lang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    for (const listener of this.listeners) {
      listener(lang);
    }
  }

  toggleLang() {
    this.setLang(this.lang === 'en' ? 'zh' : 'en');
  }

  getLang() {
    return this.lang;
  }

  onLangChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getSeasonName(seasonIdx) {
    const keys = ['spring', 'summer', 'autumn', 'winter'];
    return this.t(keys[seasonIdx] || 'spring');
  }

  getDifficulty(diff) {
    const map = { easy: 'easy', medium: 'medium', hard: 'hard' };
    return this.t(map[diff] || diff);
  }

  constellationName(c) {
    if (!c) return '';
    return this.lang === 'zh' ? c.name : (c.nameEn || c.name);
  }

  constellationDesc(c) {
    if (!c) return '';
    return this.lang === 'zh' ? c.description : (c.descriptionEn || c.description);
  }

  constellationStory(c) {
    if (!c) return '';
    return this.lang === 'zh' ? c.story : (c.storyEn || c.story);
  }

  constellationHint(c) {
    if (!c) return '';
    if (this.lang === 'zh') return c.directionHint || c.description;
    return c.directionHintEn || c.descriptionEn || c.directionHint || c.description;
  }

  constellationShapeHint(c) {
    if (!c) return '';
    if (this.lang === 'zh') return c.shapeHint || '';
    return c.shapeHintEn || c.shapeHint || '';
  }

  achievementName(ach) {
    if (!ach) return '';
    const keyMap = {
      first_star: 'achFirstConstellation',
      hunter: 'achHunter',
      master: 'achMaster',
      perfect: 'achPerfect',
      lightning: 'achSpeed',
      four_seasons: 'achSeasons',
    };
    const key = keyMap[ach.id];
    if (key) return this.t(key);
    return ach.name || '';
  }

  achievementDesc(ach) {
    if (!ach) return '';
    const keyMap = {
      first_star: 'achFirstConstellationDesc',
      hunter: 'achHunterDesc',
      master: 'achMasterDesc',
      perfect: 'achPerfectDesc',
      lightning: 'achSpeedDesc',
      four_seasons: 'achSeasonsDesc',
    };
    const key = keyMap[ach.id];
    if (key) return this.t(key);
    return ach.description || '';
  }
}

export const i18n = new I18n();
