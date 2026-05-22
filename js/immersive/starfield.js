import { raDecToCartesian, magnitudeToSize, colorIndexToRGB } from '../utils/astronomy.js';

export class StarField {
  constructor(THREE, scene, starCatalog) {
    this.THREE = THREE;
    this.scene = scene;
    this.starCatalog = starCatalog;
    this.twinklePhases = new Float32Array(starCatalog.length);
    this.twinkleSpeeds = new Float32Array(starCatalog.length);
    this.baseColors = [];

    for (let i = 0; i < starCatalog.length; i++) {
      this.twinklePhases[i] = Math.random() * Math.PI * 2;
      this.twinkleSpeeds[i] = 0.5 + Math.random() * 2;
      const color = colorIndexToRGB(starCatalog[i].ci);
      this.baseColors.push({ r: color.r, g: color.g, b: color.b });
    }

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (const star of starCatalog) {
      const pos = raDecToCartesian(star.ra, star.dec, 1000);
      positions.push(pos.x, pos.y, pos.z);
      const color = colorIndexToRGB(star.ci);
      colors.push(color.r, color.g, color.b);
      sizes.push(magnitudeToSize(star.mag));
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    this.points = new THREE.Points(geometry, material);
    scene.add(this.points);
  }

  update(dt, camera) {
    const colors = this.points.geometry.attributes.color;
    const positions = this.points.geometry.attributes.position;
    const arr = colors.array;
    const posArr = positions.array;
    const time = performance.now() / 1000;

    for (let i = 0; i < this.starCatalog.length; i++) {
      const base = this.baseColors[i];
      const twinkle = 0.7 + 0.3 * Math.sin(time * this.twinkleSpeeds[i] + this.twinklePhases[i]);

      const sy = posArr[i * 3 + 1];
      const starDist = Math.sqrt(posArr[i * 3] * posArr[i * 3] + sy * sy + posArr[i * 3 + 2] * posArr[i * 3 + 2]);
      const starElev = starDist > 0 ? Math.asin(Math.max(-1, Math.min(1, sy / starDist))) * 180 / Math.PI : 0;

      let horizonFade = 1;
      if (starElev < 5) {
        horizonFade = 0;
      } else if (starElev < 20) {
        horizonFade = (starElev - 5) / 15;
      }

      const factor = twinkle * horizonFade;
      arr[i * 3] = base.r * factor;
      arr[i * 3 + 1] = base.g * factor;
      arr[i * 3 + 2] = base.b * factor;
    }
    colors.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
