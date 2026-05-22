import { raDecToCartesian, cartesianToRaDec, angularDistance, constellationAngularRadius } from '../utils/astronomy.js';

export class ProximityDetector {
  constructor(camera, controls, constellationBounds) {
    this.camera = camera;
    this.controls = controls;
    this.bounds = constellationBounds;
    this.proximity = 0;
  }

  update() {
    const dir = this.controls.getDirection();
    const { ra, dec } = cartesianToRaDec(dir);

    const centerRA = (this.bounds.raMin + this.bounds.raMax) / 2;
    const centerDec = (this.bounds.decMin + this.bounds.decMax) / 2;
    const dist = angularDistance(ra, dec, centerRA, centerDec);
    const radius = constellationAngularRadius(this.bounds);

    this.proximity = Math.max(0, 1 - dist / (radius * 2.5));
    return this.proximity;
  }

  isNearby() {
    return this.proximity > 0.3;
  }

  isCentered() {
    return this.proximity > 0.7;
  }
}
