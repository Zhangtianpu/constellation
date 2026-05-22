export class ProximityIndicator {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'proximity-indicator';
    this.el.innerHTML = '<div class="proximity-glow"></div>';
    container.appendChild(this.el);
  }

  update(proximity) {
    const glow = this.el.querySelector('.proximity-glow');
    if (proximity > 0.1) {
      this.el.style.display = 'block';
      const intensity = Math.min(1, proximity);
      glow.style.opacity = intensity * 0.4;
      glow.style.boxShadow = `0 0 ${30 + intensity * 40}px ${10 + intensity * 20}px rgba(150, 220, 255, ${intensity * 0.3})`;
    } else {
      this.el.style.display = 'none';
    }
  }

  dispose() {
    if (this.el.parentElement) {
      this.el.parentElement.removeChild(this.el);
    }
  }
}
