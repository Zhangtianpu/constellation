export class CelestialControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.azimuth = 180;
    this.elevation = 45;
    this.fov = 60;

    this.azimuthVelocity = 0;
    this.elevationVelocity = 0;
    this.dampingFactor = 0.92;

    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.sensitivity = 0.3;
    this.downX = 0;
    this.downY = 0;
    this.hasMoved = false;
    this.DRAG_THRESHOLD = 5;

    this.destroyed = false;

    this._onPointerDown = (e) => this.onPointerDown(e);
    this._onPointerMove = (e) => this.onPointerMove(e);
    this._onPointerUp = () => this.onPointerUp();
    this._onWheel = (e) => this.onWheel(e);
    this._onTouchStart = (e) => this.onTouchStart(e);
    this._onTouchMove = (e) => this.onTouchMove(e);
    this._onTouchEnd = () => this.onPointerUp();
    this._onContextMenu = (e) => e.preventDefault();

    this.domElement.addEventListener('mousedown', this._onPointerDown);
    this.domElement.addEventListener('mousemove', this._onPointerMove);
    this.domElement.addEventListener('mouseup', this._onPointerUp);
    this.domElement.addEventListener('wheel', this._onWheel, { passive: false });
    this.domElement.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.domElement.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.domElement.addEventListener('touchend', this._onTouchEnd);
    this.domElement.addEventListener('contextmenu', this._onContextMenu);
  }

  onPointerDown(e) {
    this.isDragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.hasMoved = false;
    this.azimuthVelocity = 0;
    this.elevationVelocity = 0;
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    if (!this.hasMoved) {
      const totalDx = e.clientX - this.downX;
      const totalDy = e.clientY - this.downY;
      if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) < this.DRAG_THRESHOLD) {
        return;
      }
      this.hasMoved = true;
    }

    this.azimuthVelocity = -dx * this.sensitivity;
    this.elevationVelocity = dy * this.sensitivity;

    this.azimuth += this.azimuthVelocity;
    this.elevation += this.elevationVelocity;
  }

  onPointerUp() {
    this.isDragging = false;
  }

  onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      this.downX = e.touches[0].clientX;
      this.downY = e.touches[0].clientY;
      this.hasMoved = false;
      this.azimuthVelocity = 0;
      this.elevationVelocity = 0;
    } else if (e.touches.length === 2) {
      this._pinchStartDist = this._getPinchDistance(e.touches);
      this._pinchStartFov = this.fov;
    }
  }

  onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && this.isDragging) {
      const dx = e.touches[0].clientX - this.lastX;
      const dy = e.touches[0].clientY - this.lastY;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;

      if (!this.hasMoved) {
        const totalDx = e.touches[0].clientX - this.downX;
        const totalDy = e.touches[0].clientY - this.downY;
        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) < this.DRAG_THRESHOLD) {
          return;
        }
        this.hasMoved = true;
      }

      this.azimuthVelocity = -dx * this.sensitivity;
      this.elevationVelocity = dy * this.sensitivity;

      this.azimuth += this.azimuthVelocity;
      this.elevation += this.elevationVelocity;
    } else if (e.touches.length === 2) {
      const newDist = this._getPinchDistance(e.touches);
      if (this._pinchStartDist > 0) {
        const scale = this._pinchStartDist / newDist;
        this.fov = Math.max(20, Math.min(90, this._pinchStartFov * scale));
      }
    }
  }

  _getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onWheel(e) {
    e.preventDefault();
    this.fov = Math.max(20, Math.min(90, this.fov + e.deltaY * 0.05));
  }

  update() {
    if (this.destroyed) return;

    if (!this.isDragging) {
      this.azimuth += this.azimuthVelocity;
      this.elevation += this.elevationVelocity;
      this.azimuthVelocity *= this.dampingFactor;
      this.elevationVelocity *= this.dampingFactor;
    }

    this.elevation = Math.max(12, Math.min(85, this.elevation));
    this.azimuth = ((this.azimuth % 360) + 360) % 360;

    const azRad = this.azimuth * Math.PI / 180;
    const elRad = this.elevation * Math.PI / 180;

    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(
      Math.cos(elRad) * Math.sin(azRad),
      Math.sin(elRad),
      -Math.cos(elRad) * Math.cos(azRad)
    );
    this.camera.fov = this.fov;
    this.camera.updateProjectionMatrix();
  }

  getDirection() {
    const azRad = this.azimuth * Math.PI / 180;
    const elRad = this.elevation * Math.PI / 180;
    return {
      x: Math.cos(elRad) * Math.sin(azRad),
      y: Math.sin(elRad),
      z: -Math.cos(elRad) * Math.cos(azRad),
    };
  }

  lookAtRaDec(ra, dec) {
    this.azimuth = ra;
    this.elevation = dec;
  }

  dispose() {
    this.destroyed = true;
    this.domElement.removeEventListener('mousedown', this._onPointerDown);
    this.domElement.removeEventListener('mousemove', this._onPointerMove);
    this.domElement.removeEventListener('mouseup', this._onPointerUp);
    this.domElement.removeEventListener('wheel', this._onWheel);
    this.domElement.removeEventListener('touchstart', this._onTouchStart);
    this.domElement.removeEventListener('touchmove', this._onTouchMove);
    this.domElement.removeEventListener('touchend', this._onTouchEnd);
    this.domElement.removeEventListener('contextmenu', this._onContextMenu);
  }
}
