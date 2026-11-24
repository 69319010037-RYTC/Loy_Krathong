/* ===================================================================
   audio.js - High-Fidelity Web Audio Synthesizer & Multi-Track Mixer
   Features:
   - Layer 1: River Water & Lapping Waves
   - Layer 2: Thai Traditional Flute (Khlui) & Ranat Loy Krathong Melody
   - Layer 3: Temple Fair Crowd & Gentle Night Wind Chimes
   - Layer 4: Fireworks Launch, Resonant Boom & Crackle FX
   =================================================================== */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isPlaying = false;

    // Gain nodes for the 4 layers
    this.waterGain = null;
    this.musicGain = null;
    this.fairGain = null;
    this.fxGain = null;
    this.masterGain = null;

    // Volume states (0.0 to 1.0)
    this.volumes = {
      water: 0.65,
      music: 0.70,
      fair: 0.50,
      fx: 0.85
    };

    // Melody sequencer state
    this.melodyTimer = null;
    this.melodyIndex = 0;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Layer busses
    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.setValueAtTime(this.volumes.water, this.ctx.currentTime);
    this.waterGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.volumes.music, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.fairGain = this.ctx.createGain();
    this.fairGain.gain.setValueAtTime(this.volumes.fair, this.ctx.currentTime);
    this.fairGain.connect(this.masterGain);

    this.fxGain = this.ctx.createGain();
    this.fxGain.gain.setValueAtTime(this.volumes.fx, this.ctx.currentTime);
    this.fxGain.connect(this.masterGain);

    this.isInitialized = true;
    this.setupWaterSound();
    this.setupFairSound();
  }

  async start() {
    if (!this.isInitialized) this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isPlaying = true;
    this.startLoyKrathongMelody();
  }

  stop() {
    if (!this.ctx) return;
    this.isPlaying = false;
    if (this.melodyTimer) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  setLayerVolume(layer, val) {
    this.volumes[layer] = Math.max(0, Math.min(1, val));
    if (!this.ctx) return;
    const gainNode = this[`${layer}Gain`];
    if (gainNode) {
      gainNode.gain.setTargetAtTime(this.volumes[layer], this.ctx.currentTime, 0.05);
    }
  }

  /* ---------------- Layer 1: River Water Waves ---------------- */
  setupWaterSound() {
    // Generate pink noise buffer for realistic fluid motion
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO to modulate filter frequency simulating waves lapping the shore
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime); // 4 seconds per wave

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(this.waterGain);

    whiteNoise.start();
    lfo.start();
  }

  /* ---------------- Layer 2: Thai Traditional Ranat & Flute ---------------- */
  startLoyKrathongMelody() {
    if (this.melodyTimer) clearInterval(this.melodyTimer);

    // Iconic Loy Krathong Thai folk notes (Thai 7-tone equi-tempered / Pentatonic approximation)
    // Notes: C4=261.63, D4=293.66, E4=329.63, G4=392.00, A4=440.00, C5=523.25, D5=587.33, E5=659.25
    const N = {
      C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
      C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, REST: 0
    };

    // Melody: "วันเพ็ญเดือนสิบสอง น้ำนองเต็มตลิ่ง เราทั้งหลายชายหญิง สนุกกันจริงวันลอยกระทง"
    const score = [
      { note: N.G4, dur: 0.35 }, { note: N.A4, dur: 0.35 }, { note: N.C5, dur: 0.70 },
      { note: N.C5, dur: 0.35 }, { note: N.A4, dur: 0.35 }, { note: N.G4, dur: 0.70 },
      { note: N.G4, dur: 0.35 }, { note: N.A4, dur: 0.35 }, { note: N.C5, dur: 0.35 }, { note: N.D5, dur: 0.35 },
      { note: N.C5, dur: 0.70 }, { note: N.REST, dur: 0.35 },

      // "ลอย ลอยกระทง ลอย ลอยกระทง"
      { note: N.E5, dur: 0.35 }, { note: N.D5, dur: 0.35 }, { note: N.C5, dur: 0.70 },
      { note: N.A4, dur: 0.35 }, { note: N.C5, dur: 0.35 }, { note: N.D5, dur: 0.70 },
      { note: N.E5, dur: 0.35 }, { note: N.D5, dur: 0.35 }, { note: N.C5, dur: 0.70 },
      { note: N.A4, dur: 0.35 }, { note: N.G4, dur: 0.35 }, { note: N.C5, dur: 0.70 },

      // "ลอยกระทงกันแล้ว ขอเชิญน้องแก้วออกมารำวง"
      { note: N.C5, dur: 0.35 }, { note: N.D5, dur: 0.35 }, { note: N.E5, dur: 0.35 }, { note: N.D5, dur: 0.35 },
      { note: N.C5, dur: 0.70 }, { note: N.A4, dur: 0.70 },
      { note: N.G4, dur: 0.35 }, { note: N.A4, dur: 0.35 }, { note: N.C5, dur: 0.35 }, { note: N.D5, dur: 0.35 },
      { note: N.C5, dur: 0.90 }, { note: N.REST, dur: 0.60 }
    ];

    this.melodyIndex = 0;
    const playNext = () => {
      if (!this.isPlaying || !this.ctx) return;
      const item = score[this.melodyIndex];
      if (item.note > 0) {
        this.playRanatTone(item.note, item.dur * 0.9);
        // Play soft flute lead on accented notes
        if (this.melodyIndex % 2 === 0) {
          this.playKhluiFlute(item.note * 0.5, item.dur * 1.2);
        }
      }
      this.melodyIndex = (this.melodyIndex + 1) % score.length;
      this.melodyTimer = setTimeout(playNext, item.dur * 1000);
    };

    playNext();
  }

  // Thai Ranat Ek (Wooden xylophone with warm harmonic attack)
  playRanatTone(freq, dur) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Woody harmonic overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 3.01, now); // Metallic wooden harmonic

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    gain2.gain.setValueAtTime(0.12, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.4);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.musicGain);
    gain2.connect(this.musicGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + dur);
    osc2.stop(now + dur * 0.4);
  }

  // Thai Khlui (Bamboo Flute with gentle breath vibrato)
  playKhluiFlute(freq, dur) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Gentle vibrato
    const vibrato = this.ctx.createOscillator();
    const vGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.2, now);
    vGain.gain.setValueAtTime(freq * 0.015, now);
    vibrato.connect(vGain);
    vGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.musicGain);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + dur);
    osc.stop(now + dur);
  }

  /* ---------------- Layer 3: Temple Fair Ambiance & Bells ---------------- */
  setupFairSound() {
    // Periodic distant wind chimes & sacred temple gong
    const chimeLoop = () => {
      if (!this.isPlaying || !this.ctx) {
        setTimeout(chimeLoop, 3000);
        return;
      }
      this.playTempleChime();
      const nextDelay = 4000 + Math.random() * 6000;
      setTimeout(chimeLoop, nextDelay);
    };
    setTimeout(chimeLoop, 2000);
  }

  playTempleChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const pentatonic = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    gain.connect(this.fairGain);

    osc.start(now);
    osc.stop(now + 2.5);
  }

  /* ---------------- Layer 4: Fireworks & Lantern FX ---------------- */
  playFireworkLaunch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Launch whistle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.9);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.fxGain);

    osc.start(now);
    osc.stop(now + 0.9);

    // Burst sound after launch
    setTimeout(() => {
      this.playFireworkBurst();
    }, 850);
  }

  playFireworkBurst() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Low resonant boom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(120, now);
    boomOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

    boomGain.gain.setValueAtTime(0.4, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    boomOsc.connect(boomGain);
    boomGain.connect(this.fxGain);

    boomOsc.start(now);
    boomOsc.stop(now + 0.7);

    // Crackle noise
    const crackleLen = 0.4;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * crackleLen, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.8 ? 0.35 : 0.02);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + crackleLen);

    noise.connect(noiseGain);
    noiseGain.connect(this.fxGain);

    noise.start(now + 0.05);
  }

  playCoinDrop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.fxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const audioManager = new AudioManager();
