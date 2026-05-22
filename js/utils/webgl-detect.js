export function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

export function getWebGLCapability() {
  if (!isWebGLSupported()) return 'none';
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) return 'mobile';
  return 'desktop';
}
