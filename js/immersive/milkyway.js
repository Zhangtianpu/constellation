import { galacticToCartesian } from '../utils/astronomy.js';

export class MilkyWay {
  constructor(THREE, scene) {
    this.THREE = THREE;
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < particleCount; i++) {
      const l = Math.random() * 360;
      const b = (Math.random() - 0.5) * 30;
      const pos = galacticToCartesian(l, b, 998);
      positions.push(pos.x, pos.y, pos.z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      color: 0x8888aa,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, material);
    scene.add(this.points);
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
