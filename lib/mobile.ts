// Mobile optimization utilities for the crash game

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Haptic feedback for mobile interactions
export const hapticFeedback = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  heavy: () => vibrate(50),
  success: () => vibrate([50, 50, 50]),
  error: () => vibrate([100, 50, 100]),
  cashOut: () => vibrate([20, 20, 20, 20, 20]),
  bet: () => vibrate(30),
};

// Prevent zoom on double tap for mobile
export const preventZoom = () => {
  if (typeof document !== 'undefined') {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }
};

// Format large numbers for mobile display
export const formatMobileNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};
