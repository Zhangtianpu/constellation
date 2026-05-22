export function raDecToCartesian(raDeg, decDeg, radius) {
  const ra = raDeg * Math.PI / 180;
  const dec = decDeg * Math.PI / 180;
  return {
    x: radius * Math.cos(dec) * Math.cos(ra),
    y: radius * Math.sin(dec),
    z: -radius * Math.cos(dec) * Math.sin(ra),
  };
}

export function cartesianToRaDec(dir) {
  const dec = Math.asin(Math.max(-1, Math.min(1, dir.y))) * 180 / Math.PI;
  const ra = Math.atan2(-dir.z, dir.x) * 180 / Math.PI;
  return { ra: ((ra % 360) + 360) % 360, dec };
}

export function angularDistance(ra1, dec1, ra2, dec2) {
  const dRa = (ra2 - ra1) * Math.PI / 180;
  const d1 = dec1 * Math.PI / 180;
  const d2 = dec2 * Math.PI / 180;
  const a = Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(dRa);
  return Math.acos(Math.max(-1, Math.min(1, a))) * 180 / Math.PI;
}

export function magnitudeToSize(mag) {
  return Math.max(1, 4 - (mag - 1) * 0.6);
}

export function colorIndexToRGB(ci) {
  const t = Math.max(0, Math.min(1, (ci + 0.4) / 2.4));
  return {
    r: 0.6 + t * 0.4,
    g: 0.7 + (1 - Math.abs(t - 0.5) * 2) * 0.3,
    b: 1.0 - t * 0.5,
  };
}

export function galacticToCartesian(lDeg, bDeg, radius) {
  const l = lDeg * Math.PI / 180;
  const b = bDeg * Math.PI / 180;
  const raPole = 192.85948 * Math.PI / 180;
  const decPole = 27.12825 * Math.PI / 180;
  const sinDec = Math.sin(decPole) * Math.sin(b) + Math.cos(decPole) * Math.cos(b) * Math.cos(l);
  const dec = Math.asin(sinDec);
  const y = Math.cos(b) * Math.sin(l);
  const x = Math.cos(decPole) * Math.sin(b) - Math.sin(decPole) * Math.cos(b) * Math.cos(l);
  const ra = raPole + Math.atan2(y, x);
  return raDecToCartesian(ra * 180 / Math.PI, dec * 180 / Math.PI, radius);
}

export function constellationAngularRadius(bounds) {
  const centerRA = (bounds.raMin + bounds.raMax) / 2;
  const centerDec = (bounds.decMin + bounds.decMax) / 2;
  const d1 = angularDistance(centerRA, centerDec, bounds.raMin, bounds.decMin);
  const d2 = angularDistance(centerRA, centerDec, bounds.raMax, bounds.decMax);
  return Math.max(d1, d2);
}

export function raDecToAzEl(ra, dec, lat, lst) {
  const ha = (lst - ra) * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
  const alt = Math.asin(sinAlt);
  const cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) / (Math.cos(alt) * Math.cos(latRad));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
  return {
    azimuth: az * 180 / Math.PI,
    elevation: alt * 180 / Math.PI,
  };
}
