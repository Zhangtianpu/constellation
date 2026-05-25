import { ConstellationChecker } from './constellation.js';
import { ScoringSystem } from './scoring.js';
import { AchievementSystem } from './achievement.js';
import { audioManager } from '../utils/audio.js';
import { normalizeEdge } from '../utils/math.js';
import { i18n } from '../utils/i18n.js';
import { StarField } from '../immersive/starfield.js';
import { MilkyWay } from '../immersive/milkyway.js';
import { HorizonSilhouette } from '../immersive/horizon.js';
import { Ground } from '../immersive/ground.js';
import { CelestialControls } from '../immersive/controls.js';
import { Constellation3D } from '../immersive/constellation3d.js';
import { ConnectionParticles } from '../immersive/connection-particles.js';
import { ProximityDetector } from '../immersive/proximity.js';

export class ImmersiveGameEngine {
  constructor(store) {
    this.store = store;
    this.scoring = new ScoringSystem();
    this.achievementSystem = new AchievementSystem(store);

    this.THREE = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.starField = null;
    this.milkyWay = null;
    this.horizon = null;
    this.ground = null;
    this.constellation3d = null;
    this.connectionParticles = null;
    this.proximity = null;

    this.checker = null;
    this.constellationData = null;
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
    this.hintLevel = 1;
    this.hintTimer = 0;

    this.onComplete = null;
    this.onError = null;
    this.onTimerUpdate = null;
    this.onHintUpdate = null;
    this.onProximityUpdate = null;

    this.animFrameId = null;
  }

  async init(canvas, constellationData, starCatalog) {
    this.constellationData = constellationData;
    this.checker = new ConstellationChecker(constellationData);
    this.userEdges = [];
    this.connectedStarIds = new Set();
    this.currentStarId = null;
    this.hintsUsed = 0;
    this.undoCount = 0;
    this.completed = false;
    this.destroyed = false;
    this.hintLevel = 1;
    this.hintTimer = 0;
    this.elapsed = 0;

    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    this.THREE = THREE;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 1, 2000);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a2e, 1);

    this.controls = new CelestialControls(this.camera, canvas);

    if (constellationData.bounds) {
      const centerRA = (constellationData.bounds.raMin + constellationData.bounds.raMax) / 2;
      const centerDec = (constellationData.bounds.decMin + constellationData.bounds.decMax) / 2;
      this.controls.lookAtRaDec(centerRA, centerDec);
      this.controls.azimuth += (Math.random() - 0.5) * 120;
      this.controls.elevation += (Math.random() - 0.5) * 40;
      this.controls.elevation = Math.max(12, Math.min(85, this.controls.elevation));
    }

    this.starField = new StarField(THREE, this.scene, starCatalog);
    this.milkyWay = new MilkyWay(THREE, this.scene);
    this.horizon = new HorizonSilhouette(THREE, this.scene);
    this.ground = new Ground(THREE, this.scene, starCatalog);
    this.constellation3d = new Constellation3D(THREE, this.scene, constellationData);
    this.connectionParticles = new ConnectionParticles(THREE, this.scene);

    if (constellationData.bounds) {
      this.proximity = new ProximityDetector(this.camera, this.controls, constellationData.bounds);
    }

    this.startTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.completed) {
        this.elapsed = (Date.now() - this.startTime) / 1000;
        if (this.onTimerUpdate) this.onTimerUpdate(this.elapsed);
      }
    }, 100);

    this.startRenderLoop();
  }

  startRenderLoop() {
    let lastTime = performance.now();
    const loop = () => {
      if (this.destroyed) return;
      this.animFrameId = requestAnimationFrame(loop);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      this.controls.update();

      if (this.starField) this.starField.update(dt, this.camera);
      if (this.ground) this.ground.update(dt);
      if (this.connectionParticles) this.connectionParticles.update(dt);

      if (this.proximity) {
        const prox = this.proximity.update();
        if (this.onProximityUpdate) this.onProximityUpdate(prox);

        this.hintTimer += dt;
        if (prox > 0.7 && this.hintLevel < 3) {
          this.hintLevel = 3;
          if (this.onHintUpdate) this.onHintUpdate(3);
        } else if (prox > 0.3 && this.hintLevel < 2) {
          this.hintLevel = 2;
          if (this.onHintUpdate) this.onHintUpdate(2);
        }
        if (this.hintTimer > 30 && this.hintLevel < 2) {
          this.hintLevel = 2;
          if (this.onHintUpdate) this.onHintUpdate(2);
        }
        if (this.hintTimer > 60 && this.hintLevel < 3) {
          this.hintLevel = 3;
          if (this.onHintUpdate) this.onHintUpdate(3);
        }

        if (this.hintLevel >= 2 && !this.completed) {
          this.constellation3d.pulseStars(dt);
        }
        if (this.hintLevel >= 3) {
          this.constellation3d.setReferenceLineVisibility(true);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  handleStarClick(clientX, clientY) {
    if (this.completed || !this.constellation3d) return;

    const canvas = this.renderer.domElement;
    const starId = this.constellation3d.getHitStar(clientX, clientY, this.camera, canvas);
    console.log('[Immersive] handleStarClick:', { clientX, clientY, starId, currentStarId: this.currentStarId, connectedStarIds: [...this.connectedStarIds] });
    if (starId === null) return;

    if (this.currentStarId === null) {
      this.currentStarId = starId;
      this.connectedStarIds.add(starId);
      this.constellation3d.setStarSelected(starId, true);
      audioManager.playClick();
      console.log('[Immersive] Star selected:', starId);
      return;
    }

    if (starId === this.currentStarId) {
      this.constellation3d.setStarSelected(this.currentStarId, false);
      if (!this.userEdges.some(e => e.from === starId || e.to === starId)) {
        this.connectedStarIds.delete(starId);
      }
      this.currentStarId = null;
      console.log('[Immersive] Star deselected:', starId);
      return;
    }

    if (this.connectedStarIds.has(starId)) {
      const fromId = this.currentStarId;
      const toId = starId;
      const edgeKey = normalizeEdge(fromId, toId);
      const edgeExists = this.userEdges.some(e => normalizeEdge(e.from, e.to) === edgeKey);

      if (edgeExists) {
        this.switchCurrentStar(starId);
        console.log('[Immersive] Switched to connected star:', starId);
        return;
      }

      if (this.checker.isEdgeValid(fromId, toId)) {
        this.addEdge(fromId, toId);
        audioManager.playConnect();
        console.log('[Immersive] Edge added (connected star):', fromId, '->', toId);
        this.checkCompletion();
      } else {
        this.switchCurrentStar(starId);
        console.log('[Immersive] Invalid edge, switched to:', starId);
      }
      return;
    }

    const fromId = this.currentStarId;
    const toId = starId;

    if (this.checker.isEdgeValid(fromId, toId)) {
      this.addEdge(fromId, toId);
      audioManager.playConnect();
      console.log('[Immersive] Edge added:', fromId, '->', toId);
      this.checkCompletion();
    } else {
      audioManager.playError();
      console.log('[Immersive] Invalid edge:', fromId, '->', toId, '. Valid edges:', this.checker.edges);
      if (this.onError) this.onError(i18n.t('invalidEdge'));
    }
  }

  switchCurrentStar(starId) {
    if (this.currentStarId !== null) {
      this.constellation3d.setStarSelected(this.currentStarId, false);
    }
    this.currentStarId = starId;
    this.constellation3d.setStarSelected(starId, true);
    audioManager.playClick();
  }

  addEdge(fromId, toId) {
    this.userEdges.push({ from: fromId, to: toId });
    this.connectedStarIds.add(fromId);
    this.connectedStarIds.add(toId);

    this.constellation3d.setStarSelected(fromId, false);
    this.constellation3d.setStarSelected(toId, true);
    this.constellation3d.addConnectionLine(fromId, toId);

    if (this.connectionParticles) {
      const fromMesh = this.constellation3d.starMeshes.find(m => m.userData.starId === fromId);
      const toMesh = this.constellation3d.starMeshes.find(m => m.userData.starId === toId);
      if (fromMesh && toMesh) {
        this.connectionParticles.addConnection(fromMesh.position, toMesh.position);
      }
    }

    this.currentStarId = toId;
  }

  undo() {
    if (this.userEdges.length === 0 || this.completed) return;
    const lastEdge = this.userEdges.pop();
    this.undoCount++;

    this.constellation3d.removeLastConnectionLine();
    if (this.connectionParticles) this.connectionParticles.removeLastConnection();

    this.connectedStarIds.clear();
    if (this.userEdges.length === 0) {
      this.connectedStarIds.add(lastEdge.from);
    } else {
      for (const edge of this.userEdges) {
        this.connectedStarIds.add(edge.from);
        this.connectedStarIds.add(edge.to);
      }
    }

    if (this.currentStarId !== null) {
      this.constellation3d.setStarSelected(this.currentStarId, false);
    }
    this.currentStarId = lastEdge.from;
    this.constellation3d.setStarSelected(lastEdge.from, true);
    audioManager.playClick();
  }

  useHint() {
    if (this.completed) return;
    this.hintsUsed++;
    audioManager.playHint();

    if (this.hintLevel < 2) {
      this.hintLevel = 2;
      if (this.onHintUpdate) this.onHintUpdate(2);
    }

    return this.getHintText();
  }

  getHintText() {
    if (this.hintLevel === 1) {
      return this.constellationData.directionHint || '旋转视角寻找星座';
    } else if (this.hintLevel === 2) {
      return this.constellationData.shapeHint || '注意脉动的亮星';
    }
    return '参考连线已显示，点击亮星完成连线';
  }

  checkCompletion() {
    const result = this.checker.check(this.userEdges);
    if (result.correct) {
      this.completed = true;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      for (const starId of this.connectedStarIds) {
        this.constellation3d.setStarCompleted(starId);
      }

      audioManager.playComplete();

      const { score, stars } = this.scoring.calculate(
        this.elapsed,
        this.hintsUsed,
        this.undoCount,
        this.constellationData.difficulty
      );
      const finalScore = Math.round(score * 1.5);

      this.store.completeLevel(this.constellationData.id, stars, finalScore);

      const completedCount = Object.keys(this.store.getState().completedLevels).length;
      const data = this.store.getState().constellationData;
      let allSeasons = false;
      if (data) {
        allSeasons = data.seasons.every(s => s.constellations.every(c => this.store.isLevelCompleted(c.id)));
      }

      const achievementStats = {
        completedCount,
        perfectClear: this.hintsUsed === 0,
        fastClear: this.elapsed < 30,
        allSeasons,
      };
      const newAchievements = this.achievementSystem.checkAll(achievementStats);

      if (this.onComplete) {
        setTimeout(() => {
          if (this.destroyed) return;
          this.onComplete({
            score: finalScore,
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

  resize(width, height) {
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  destroy() {
    this.destroyed = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.controls) this.controls.dispose();
    if (this.starField) this.starField.dispose();
    if (this.milkyWay) this.milkyWay.dispose();
    if (this.horizon) this.horizon.dispose();
    if (this.ground) this.ground.dispose();
    if (this.constellation3d) this.constellation3d.dispose();
    if (this.connectionParticles) this.connectionParticles.dispose();
    if (this.renderer) this.renderer.dispose();
  }
}
