// Sound management for the crash game
let audioContext: AudioContext | null = null;
let soundEnabled = true;
let musicEnabled = true;

// Initialize audio context
const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
      return null;
    }
  }
  return audioContext;
};

export const playSound = {
  bet: () => {
    if (!soundEnabled) return;
    
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.frequency.setValueAtTime(1000, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  },

  cashOut: () => {
    if (!soundEnabled) return;
    
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.frequency.setValueAtTime(600, context.currentTime);
    oscillator.frequency.setValueAtTime(800, context.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1200, context.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  },

  flightCrash: () => {
    if (!soundEnabled) return;
    
    // Play plane flying away sound with doppler effect
    const context = getAudioContext();
    if (!context) return;

    // Create a doppler effect - plane flying away
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Start with engine sound, then fade to distance
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 2);
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 2);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 2);
  },

  countdown: () => {
    if (!soundEnabled) return;
    
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  }
};

export const soundControls = {
  toggleSound: () => {
    soundEnabled = !soundEnabled;
    return soundEnabled;
  },
  
  toggleMusic: () => {
    musicEnabled = !musicEnabled;
    return musicEnabled;
  },
  
  isSoundEnabled: () => soundEnabled,
  isMusicEnabled: () => musicEnabled
};
