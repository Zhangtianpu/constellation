import { i18n } from '../utils/i18n.js';

export class HorizonSilhouette {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.meshes = [];

    this.addCompassMarkers(THREE, scene);
  }

  addCompassMarkers(THREE, scene) {
    const labels = [
      { text: i18n.t('north'), angle: 0 },
      { text: i18n.t('east'), angle: 90 },
      { text: i18n.t('south'), angle: 180 },
      { text: i18n.t('west'), angle: 270 },
    ];

    for (const label of labels) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.text, 32, 16);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(20, 10, 1);

      const rad = label.angle * Math.PI / 180;
      sprite.position.set(
        Math.sin(rad) * 630,
        10,
        -Math.cos(rad) * 630
      );
      scene.add(sprite);
      this.meshes.push(sprite);
    }
  }

  dispose() {
    for (const mesh of this.meshes) {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      }
    }
  }
}
