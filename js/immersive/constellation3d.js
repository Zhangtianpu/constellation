import { raDecToCartesian, magnitudeToSize, colorIndexToRGB } from '../utils/astronomy.js';

export class Constellation3D {
  constructor(THREE, scene, constellationData) {
    this.THREE = THREE;
    this.scene = scene;
    this.data = constellationData;
    this.starMeshes = [];
    this.lineGroup = new THREE.Group();
    this.referenceLineGroup = new THREE.Group();
    this.pulsePhase = 0;
    this.referenceVisible = false;

    scene.add(this.lineGroup);
    scene.add(this.referenceLineGroup);

    this.createStars(THREE, scene, constellationData);
    this.createReferenceLines(THREE, constellationData);
  }

  createStars(THREE, scene, data) {
    const stars3d = data.stars_3d || [];
    for (const s of stars3d) {
      const pos = raDecToCartesian(s.ra, s.dec, 1000);
      const size = Math.max(3, magnitudeToSize(s.mag) * 2);
      const color = colorIndexToRGB(s.ci);

      const geometry = new THREE.SphereGeometry(size * 0.3, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color.r, color.g, color.b),
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.userData = { starId: s.id, name: s.name || '', baseSize: size * 0.3 };
      scene.add(mesh);
      this.starMeshes.push(mesh);

      const glowGeo = new THREE.SphereGeometry(size * 1.2, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color.r, color.g, color.b),
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(mesh.position);
      glow.userData = { isGlow: true, parentStarId: s.id };
      scene.add(glow);
      mesh.userData.glowMesh = glow;
    }
  }

  createReferenceLines(THREE, data) {
    const stars3d = data.stars_3d || [];
    const edges = data.edges || [];
    const starMap = {};
    for (const s of stars3d) {
      starMap[s.id] = raDecToCartesian(s.ra, s.dec, 1000);
    }

    for (const edge of edges) {
      const from = starMap[edge.from];
      const to = starMap[edge.to];
      if (!from || !to) continue;

      const fromVec = new THREE.Vector3(from.x, from.y, from.z);
      const toVec = new THREE.Vector3(to.x, to.y, to.z);
      const mesh = this._createCylinder(fromVec, toVec, 0.2, new THREE.MeshBasicMaterial({
        color: 0xffd764,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }));
      this.referenceLineGroup.add(mesh);
    }

    this.referenceLineGroup.visible = false;
  }

  _createCylinder(from, to, radius, material) {
    const direction = new this.THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const geometry = new this.THREE.CylinderGeometry(radius, radius, length, 6, 1);

    const mesh = new this.THREE.Mesh(geometry, material);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);

    const yAxis = new this.THREE.Vector3(0, 1, 0);
    const quaternion = new this.THREE.Quaternion().setFromUnitVectors(yAxis, direction.normalize());
    mesh.quaternion.copy(quaternion);

    return mesh;
  }

  addConnectionLine(fromId, toId) {
    const fromMesh = this.starMeshes.find(m => m.userData.starId === fromId);
    const toMesh = this.starMeshes.find(m => m.userData.starId === toId);
    if (!fromMesh || !toMesh) return;

    const mesh = this._createCylinder(fromMesh.position, toMesh.position, 0.4, new this.THREE.MeshBasicMaterial({
      color: 0xffd764,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }));
    this.lineGroup.add(mesh);

    const glowMesh = this._createCylinder(fromMesh.position, toMesh.position, 0.4, new this.THREE.MeshBasicMaterial({
      color: 0xffd764,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    }));
    glowMesh.scale.set(2.5, 1, 2.5);
    this.lineGroup.add(glowMesh);

    return mesh;
  }

  removeLastConnectionLine() {
    const count = this.lineGroup.children.length;
    if (count >= 2) {
      const glow = this.lineGroup.children[count - 1];
      const line = this.lineGroup.children[count - 2];
      glow.geometry.dispose();
      glow.material.dispose();
      this.lineGroup.remove(glow);
      line.geometry.dispose();
      line.material.dispose();
      this.lineGroup.remove(line);
    }
  }

  pulseStars(dt) {
    this.pulsePhase += dt * 3;
    const pulseScale = 1 + 0.3 * Math.sin(this.pulsePhase);
    for (const mesh of this.starMeshes) {
      const glow = mesh.userData.glowMesh;
      if (glow) {
        const isSelected = mesh.material.color.r > 0.9 && mesh.material.color.g > 0.9 && mesh.material.color.b > 0.9;
        if (isSelected) {
          glow.scale.setScalar(2.0 * pulseScale);
          glow.material.opacity = 0.4 + 0.15 * Math.sin(this.pulsePhase);
        } else {
          glow.scale.setScalar(pulseScale);
          glow.material.opacity = 0.15 + 0.1 * Math.sin(this.pulsePhase);
        }
      }
    }
  }

  setReferenceLineVisibility(visible) {
    this.referenceVisible = visible;
    this.referenceLineGroup.visible = visible;
    if (visible) {
      for (const child of this.referenceLineGroup.children) {
        child.material.opacity = 0.2;
      }
    }
  }

  setStarSelected(starId, selected) {
    const mesh = this.starMeshes.find(m => m.userData.starId === starId);
    if (mesh) {
      if (selected) {
        mesh.material.color.setHex(0xffffff);
        mesh.material.opacity = 1;
        mesh.scale.setScalar(1.8);
      } else {
        const s = (this.data.stars_3d || []).find(s => s.id === starId);
        if (s) {
          const color = colorIndexToRGB(s.ci);
          mesh.material.color.setRGB(color.r, color.g, color.b);
        }
        mesh.material.opacity = 0.9;
        mesh.scale.setScalar(1);
      }
      const glow = mesh.userData.glowMesh;
      if (glow) {
        glow.material.opacity = selected ? 0.5 : 0.15;
        glow.scale.setScalar(selected ? 2.0 : 1);
        if (selected) {
          glow.material.color.setHex(0xffffff);
        } else {
          const s = (this.data.stars_3d || []).find(s => s.id === starId);
          if (s) {
            const color = colorIndexToRGB(s.ci);
            glow.material.color.setRGB(color.r, color.g, color.b);
          }
        }
      }
    }
  }

  setStarCompleted(starId) {
    const mesh = this.starMeshes.find(m => m.userData.starId === starId);
    if (mesh) {
      mesh.material.color.setHex(0xffd764);
      mesh.material.opacity = 1;
      const glow = mesh.userData.glowMesh;
      if (glow) {
        glow.material.color.setHex(0xffd764);
        glow.material.opacity = 0.3;
      }
    }
  }

  getHitStar(clientX, clientY, camera, canvas) {
    camera.updateMatrixWorld();

    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const hitRadius = Math.max(25, Math.min(width, height) * 0.04);
    let closest = null;
    let closestDist = Infinity;

    const tempVec = new this.THREE.Vector3();

    for (const mesh of this.starMeshes) {
      tempVec.copy(mesh.position);
      tempVec.project(camera);

      if (tempVec.z > 1 || tempVec.z < -1) continue;

      const sx = (tempVec.x + 1) / 2 * width;
      const sy = (-tempVec.y + 1) / 2 * height;

      const dx = sx - canvasX;
      const dy = sy - canvasY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < hitRadius && dist < closestDist) {
        closest = mesh;
        closestDist = dist;
      }
    }

    return closest ? closest.userData.starId : null;
  }

  dispose() {
    for (const mesh of this.starMeshes) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      const glow = mesh.userData.glowMesh;
      if (glow) {
        glow.geometry.dispose();
        glow.material.dispose();
      }
    }
    for (const line of this.referenceLineGroup.children) {
      line.geometry.dispose();
      line.material.dispose();
    }
    for (const line of this.lineGroup.children) {
      line.geometry.dispose();
      line.material.dispose();
    }
  }
}
