import { store } from './store.js';
import { HomePage } from './ui/home.js';
import { LevelSelectPage } from './ui/level-select.js';
import { GameplayPage } from './ui/gameplay.js';
import { ImmersiveGameplayPage } from './ui/immersive-gameplay.js';
import { ResultPage } from './ui/result.js';

const app = document.getElementById('app');

let currentPage = null;
let currentInstance = null;

const pageMap = {
  home: HomePage,
  levelSelect: LevelSelectPage,
  gameplay: GameplayPage,
  immersiveGameplay: ImmersiveGameplayPage,
  result: ResultPage,
};

function renderPage(state, prev) {
  const page = state.currentPage;
  if (prev && page === prev.currentPage) return;

  if (currentInstance && currentInstance.destroy) {
    currentInstance.destroy();
  }

  currentPage = page;
  const PageClass = pageMap[page];
  if (!PageClass) return;

  currentInstance = new PageClass(app, store);
  currentInstance.render();
}

async function init() {
  try {
    const response = await fetch('data/constellations.json');
    const data = await response.json();
    store.setConstellationData(data);
  } catch (e) {
    console.error('Failed to load constellation data:', e);
  }

  store.restore();
  store.subscribe(renderPage);
  renderPage(store.getState(), null);
}

init();
