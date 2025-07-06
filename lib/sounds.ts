// Sound effects for the crash game

class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private backgroundMusic: HTMLAudioElement | null = null;
  private enabled: boolean = true;
  private musicEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSounds();
      this.initBackgroundMusic();
    }
  }

  private initSounds() {
    // Create audio elements for different game sounds
    this.sounds = {
      bet: this.createAudio(440, 0.1, 'sine'), // Bet placed sound
      cashout: this.createAudio(660, 0.2, 'triangle'), // Cash out sound
      crash: this.createAudio(220, 0.5, 'sawtooth'), // Crash sound
      countdown: this.createAudio(800, 0.05, 'square'), // Countdown tick
      flightCrash: this.createFlightCrashSound(), // Flight crash sound
    };
  }

  private initBackgroundMusic() {
    // Create background music with a simple melody
    this.backgroundMusic = this.createBackgroundMusic();
  }

  private createAudio(frequency: number, duration: number, type: OscillatorType): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    // Create a dummy audio element since we're using Web Audio API
    const audio = new Audio();
    audio.play = () => {
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      return Promise.resolve();
    };

    return audio;
  }

  private createFlightCrashSound(): HTMLAudioElement {
    const audio = new Audio();
    audio.play = () => {
      if (!this.enabled) return Promise.resolve();

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a dramatic crash sound sequence
      this.playFlightCrashSequence(audioContext);
      
      return Promise.resolve();
    };
    return audio;
  }

  private playFlightCrashSequence(audioContext: AudioContext) {
    // Flight engine failing sound
    const engineFail = audioContext.createOscillator();
    const engineGain = audioContext.createGain();
    
    engineFail.connect(engineGain);
    engineGain.connect(audioContext.destination);
    
    engineFail.type = 'sawtooth';
    engineFail.frequency.setValueAtTime(200, audioContext.currentTime);
    engineFail.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
    
    engineGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    engineGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    engineFail.start(audioContext.currentTime);
    engineFail.stop(audioContext.currentTime + 0.5);

    // Explosion sound
    setTimeout(() => {
      const explosion = audioContext.createOscillator();
      const explosionGain = audioContext.createGain();
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
      const noiseSource = audioContext.createBufferSource();
      
      // Generate white noise for explosion
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      
      noiseSource.buffer = noiseBuffer;
      noiseSource.connect(explosionGain);
      explosionGain.connect(audioContext.destination);
      
      explosionGain.gain.setValueAtTime(0.4, audioContext.currentTime);
      explosionGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      noiseSource.start(audioContext.currentTime);
    }, 500);
  }

  private createBackgroundMusic(): HTMLAudioElement {
    const audio = new Audio();
    let isPlaying = false;
    let musicLoop: NodeJS.Timeout | null = null;

    audio.play = () => {
      if (!this.musicEnabled || isPlaying) return Promise.resolve();
      
      isPlaying = true;
      this.playBackgroundMelody();
      
      // Loop the music every 8 seconds
      musicLoop = setInterval(() => {
        if (this.musicEnabled && isPlaying) {
          this.playBackgroundMelody();
        }
      }, 8000);
      
      return Promise.resolve();
    };

    audio.pause = () => {
      isPlaying = false;
      if (musicLoop) {
        clearInterval(musicLoop);
        musicLoop = null;
      }
    };

    audio.volume = 0.3; // Lower volume for background music

    return audio;
  }

  private playBackgroundMelody() {
    if (!this.musicEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Simple melody notes (frequencies)
    const melody = [
      { freq: 523.25, duration: 0.5 }, // C5
      { freq: 587.33, duration: 0.5 }, // D5
      { freq: 659.25, duration: 0.5 }, // E5
      { freq: 698.46, duration: 0.5 }, // F5
      { freq: 783.99, duration: 1.0 }, // G5
      { freq: 698.46, duration: 0.5 }, // F5
      { freq: 659.25, duration: 0.5 }, // E5
      { freq: 587.33, duration: 1.0 }, // D5
      { freq: 523.25, duration: 2.0 }, // C5
    ];

    let currentTime = audioContext.currentTime;

    melody.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(note.freq, currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.01); // Soft volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);

      currentTime += note.duration;
    });
  }

  play(soundName: string) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    try {
      this.sounds[soundName].play();
    } catch (error) {
      console.warn('Could not play sound:', soundName, error);
    }
  }

  playBackgroundMusic() {
    if (this.backgroundMusic && this.musicEnabled) {
      this.backgroundMusic.play();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.musicEnabled;
  }

  getSoundStatus() {
    return { soundEnabled: this.enabled, musicEnabled: this.musicEnabled };
  }
}

export const soundManager = new SoundManager();

export const playSound = {
  bet: () => soundManager.play('bet'),
  cashOut: () => soundManager.play('cashout'),
  crash: () => soundManager.play('crash'),
  countdown: () => soundManager.play('countdown'),
  flightCrash: () => soundManager.play('flightCrash'),
};

export const backgroundMusic = {
  play: () => soundManager.playBackgroundMusic(),
  stop: () => soundManager.stopBackgroundMusic(),
  toggle: () => soundManager.toggleMusic(),
};

export default soundManager;
