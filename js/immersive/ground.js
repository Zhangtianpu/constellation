export class Ground {
  constructor(THREE, scene, starCatalog) {
    this.THREE = THREE;
    this.scene = scene;
    this.meshes = [];
    this.grassPhases = null;
    this.grassBasePositions = null;
    this.grassPoints = null;
    this.time = 0;

    this.createGroundPlane(THREE, scene);
    this.createGrassParticles(THREE, scene);
    this.createMountainLayers(THREE, scene);
    this.createStarReflections(THREE, scene, starCatalog);
  }

  createGroundPlane(THREE, scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
    grad.addColorStop(0, '#0a1a0a');
    grad.addColorStop(0.5, '#061206');
    grad.addColorStop(1, '#030a03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const brightness = 10 + Math.random() * 30;
      ctx.fillStyle = `rgba(${brightness}, ${brightness + 20}, ${brightness}, 0.3)`;
      ctx.fillRect(x, y, 1, 2 + Math.random() * 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);

    const geometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -5;
    scene.add(plane);
    this.meshes.push(plane);
  }

  createGrassParticles(THREE, scene) {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.grassPhases = new Float32Array(count);
    this.grassBasePositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 500;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = -4 + Math.random() * 2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.grassBasePositions[i * 3] = x;
      this.grassBasePositions[i * 3 + 1] = y;
      this.grassBasePositions[i * 3 + 2] = z;

      this.grassPhases[i] = Math.random() * Math.PI * 2;

      const g = 0.15 + Math.random() * 0.2;
      colors[i * 3] = g * 0.6;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = g * 0.4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    this.grassPoints = new THREE.Points(geometry, material);
    scene.add(this.grassPoints);
  }

  createMountainLayers(THREE, scene) {
    const layers = [
      { radius: 650, height: 40, baseY: -5, color: '#030308', skyColor: 'rgba(10,10,46,0)', peakVariation: 8, treeChance: 0.5 },
      { radius: 750, height: 60, baseY: -5, color: '#050518', skyColor: 'rgba(10,10,46,0)', peakVariation: 15, treeChance: 0.2 },
      { radius: 850, height: 80, baseY: -5, color: '#0a0a28', skyColor: 'rgba(10,10,46,0)', peakVariation: 25, treeChance: 0 },
    ];

    for (const layer of layers) {
      const texture = this.createMountainTexture(THREE, layer);
      const geometry = new THREE.CylinderGeometry(layer.radius, layer.radius, layer.height, 64, 1, true);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = layer.baseY + layer.height / 2;
      scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  createMountainTexture(THREE, layer) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, layer.skyColor);
    grad.addColorStop(0.3, layer.skyColor);
    grad.addColorStop(0.5, layer.color);
    grad.addColorStop(1, layer.color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 256);

    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    let x = 0;
    while (x < 2048) {
      const peakHeight = 100 + Math.sin(x * 0.002) * layer.peakVariation + Math.sin(x * 0.008) * (layer.peakVariation * 0.6) + Math.sin(x * 0.04) * (layer.peakVariation * 0.2);
      const y = 256 - peakHeight;
      const nextX = x + 20 + Math.random() * 40;
      const cp1x = x + (nextX - x) * 0.3;
      const cp1y = y - Math.random() * 10;
      const cp2x = x + (nextX - x) * 0.7;
      const cp2y = y + Math.random() * 15;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, nextX, y + Math.random() * 10);
      x = nextX;
    }
    ctx.lineTo(2048, 256);
    ctx.closePath();
    ctx.fill();

    if (layer.treeChance > 0) {
      ctx.fillStyle = layer.color;
      for (let tx = 0; tx < 2048; tx += 15 + Math.random() * 30) {
        if (Math.random() > layer.treeChance) continue;
        const h = 6 + Math.random() * 12;
        const baseY = 140 + Math.random() * 40;
        ctx.beginPath();
        ctx.moveTo(tx, 256);
        ctx.lineTo(tx - 3, baseY);
        ctx.lineTo(tx + 1, baseY - h);
        ctx.lineTo(tx + 5, baseY - h * 0.6);
        ctx.lineTo(tx + 7, baseY);
        ctx.lineTo(tx + 3, 256);
        ctx.fill();
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  createStarReflections(THREE, scene, starCatalog) {
    if (!starCatalog || starCatalog.length === 0) return;

    const brightStars = starCatalog.filter(s => s.mag < 3);
    const count = Math.min(brightStars.length * 3, 200);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const star = brightStars[i % brightStars.length];
      const ra = star.ra * Math.PI / 180;
      const dec = star.dec * Math.PI / 180;
      const r = 600;

      positions[i * 3] = r * Math.cos(dec) * Math.cos(ra) + (Math.random() - 0.5) * 5;
      positions[i * 3 + 1] = -4 + Math.random() * 1;
      positions[i * 3 + 2] = -r * Math.cos(dec) * Math.sin(ra) + (Math.random() - 0.5) * 5;

      const brightness = 0.3 + (3 - star.mag) * 0.15;
      colors[i * 3] = brightness * 0.8;
      colors[i * 3 + 1] = brightness * 0.9;
      colors[i * 3 + 2] = brightness;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    this.meshes.push(points);
  }

  update(dt) {
    this.time += dt;

    if (this.grassPoints && this.grassPhases) {
      const positions = this.grassPoints.geometry.attributes.position.array;
      const count = this.grassPhases.length;

      for (let i = 0; i < count; i++) {
        const sway = Math.sin(this.time * 1.5 + this.grassPhases[i]) * 0.3;
        positions[i * 3] = this.grassBasePositions[i * 3] + sway;
      }

      this.grassPoints.geometry.attributes.position.needsUpdate = true;
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
    if (this.grassPoints) {
      this.grassPoints.geometry.dispose();
      this.grassPoints.material.dispose();
    }
  }
}
