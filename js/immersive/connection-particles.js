export class ConnectionParticles {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.particleGroups = [];
  }

  addConnection(fromPos, toPos) {
    const particleCount = 40;
    const geometry = new this.THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      offsets[i] = Math.random();
      sizes[i] = 1 + Math.random() * 2;
    }

    geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(positions, 3));

    const material = new this.THREE.PointsMaterial({
      size: 2.5,
      color: 0xffd764,
      transparent: true,
      opacity: 0.9,
      blending: this.THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new this.THREE.Points(geometry, material);
    this.scene.add(points);

    const direction = new this.THREE.Vector3().subVectors(toPos, fromPos);
    const perpX = Math.abs(direction.x) < 0.9 ? new this.THREE.Vector3(1, 0, 0) : new this.THREE.Vector3(0, 1, 0);
    const perp = new this.THREE.Vector3().crossVectors(direction, perpX).normalize();

    this.particleGroups.push({
      points,
      fromPos: fromPos.clone(),
      toPos: toPos.clone(),
      offsets,
      sizes,
      particleCount,
      perp,
    });

    return points;
  }

  removeLastConnection() {
    if (this.particleGroups.length === 0) return;
    const group = this.particleGroups.pop();
    group.points.geometry.dispose();
    group.points.material.dispose();
    this.scene.remove(group.points);
  }

  update(dt) {
    for (const group of this.particleGroups) {
      const positions = group.points.geometry.attributes.position.array;
      for (let i = 0; i < group.particleCount; i++) {
        group.offsets[i] = (group.offsets[i] + dt * (0.15 + group.sizes[i] * 0.05)) % 1;
        const t = group.offsets[i];

        const x = group.fromPos.x + (group.toPos.x - group.fromPos.x) * t;
        const y = group.fromPos.y + (group.toPos.y - group.fromPos.y) * t;
        const z = group.fromPos.z + (group.toPos.z - group.fromPos.z) * t;

        const spread = Math.sin(t * Math.PI) * 0.8;
        const perpOffset = Math.sin(t * 20 + i) * spread;

        positions[i * 3] = x + group.perp.x * perpOffset;
        positions[i * 3 + 1] = y + group.perp.y * perpOffset;
        positions[i * 3 + 2] = z + group.perp.z * perpOffset;
      }
      group.points.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    for (const group of this.particleGroups) {
      group.points.geometry.dispose();
      group.points.material.dispose();
      this.scene.remove(group.points);
    }
    this.particleGroups = [];
  }
}
