/* ===================================================================
   main.js - 3D Loy Krathong Master Application
   Vibrant, Crystal-Clear Rendering (MeshLambert/Phong Lighting)
   =================================================================== */

import { translations, getLang, setLang, toggleLang, updateDOMTranslations } from './i18n.js';
import { audioManager } from './audio.js';
import { KrathongSystem } from './krathong.js';
import { Environment } from './environment.js';
import { FestivalStalls } from './stalls.js';
import { NPCManager } from './characters.js';
import { ParticleManager } from './particles.js';

class LoyKrathongApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.clock = new THREE.Clock();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.environment = null;
    this.stalls = null;
    this.krathongSystem = null;
    this.npcManager = null;
    this.particleManager = null;

    // Perfectly framed camera presets for each zone
    this.cameraPresets = {
      // 1. ท่าน้ำลอยกระทง: Elevated view seeing the pier, kneeling devotees, and river full of glowing krathongs & moon!
      river: {
        pos: new THREE.Vector3(0, 8.5, 10.0),
        target: new THREE.Vector3(0, 0.0, -16.0)
      },
      // 2. ตลาดน้ำ & สตรีทฟู้ด: Standing at the entrance of the market looking down the vibrant food street
      market: {
        pos: new THREE.Vector3(-22.0, 3.5, 0.0),
        target: new THREE.Vector3(-22.0, 1.5, 16.0)
      },
      // 3. เวทีศิลปวัฒนธรรม: Front-row view facing the grand Thai cultural stage with dancers
      stage: {
        pos: new THREE.Vector3(14.0, 3.0, 9.0),
        target: new THREE.Vector3(28.0, 2.0, 9.0)
      },
      // 4. ซุ้มเกมงานวัด: Facing the 4 colorful carnival game booths
      games: {
        pos: new THREE.Vector3(-17.0, 3.0, 20.0),
        target: new THREE.Vector3(-17.0, 1.8, 30.0)
      },
      // 5. โซนทำบุญไหว้พระ: Courtyard view of the golden Birthday Buddhas and Luk Nimit
      merit: {
        pos: new THREE.Vector3(16.0, 3.0, 22.0),
        target: new THREE.Vector3(25.0, 2.0, 28.0)
      },
      // 6. วิวมุมสูงพานอรามา: Grand bird's eye view seeing the entire festival, all 5 zones, river, moon, and fireworks
      panorama: {
        pos: new THREE.Vector3(0, 32.0, 42.0),
        target: new THREE.Vector3(0, 1.0, 6.0)
      }
    };

    this.currentZone = 'river';
    this.isTransitioningCamera = false;
    this.cameraStartPos = new THREE.Vector3();
    this.cameraEndPos = new THREE.Vector3();
    this.targetStart = new THREE.Vector3();
    this.targetEnd = new THREE.Vector3();
    this.cameraTransitionAlpha = 1.0;

    this.studioConfig = {
      base: 'banana',
      petal: 'lotus',
      flower: 'marigold',
      candleType: 'warm'
    };

    this.init();
  }

  init() {
    this.setupThree();
    this.setupSubsystems();
    this.setupUIEvents();
    this.setupBilingual();

    // Check URL hash for direct zone navigation (e.g. #market, #stage, #games, #merit)
    const hash = window.location.hash.replace('#', '');
    if (hash && this.cameraPresets[hash]) {
      this.currentZone = hash;
      const preset = this.cameraPresets[hash];
      this.camera.position.copy(preset.pos);
      this.controls.target.copy(preset.target);
      this.controls.update();
      document.querySelectorAll('.zone-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-zone') === hash);
      });
    }

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && this.cameraPresets[h]) {
        this.switchCameraZone(h);
      }
    });

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  setupThree() {
    // 1. Scene with Warm Terracotta Night Sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a0f0b); // Deep night warm sepia
    this.scene.fog = new THREE.Fog(0x241610, 45, 170);

    // 2. Camera
    const fov = 48;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 500);
    const startPreset = this.cameraPresets.river;
    this.camera.position.copy(startPreset.pos);

    // 3. Ultra-Optimized WebGL Renderer (Smooth 60 FPS on any laptop/mobile)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // 4. OrbitControls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 120.0;
    this.controls.target.copy(startPreset.target);
    this.controls.update();
  }

  setupSubsystems() {
    this.environment = new Environment(this.scene);
    this.stalls = new FestivalStalls(this.scene);
    this.krathongSystem = new KrathongSystem(this.scene);
    this.npcManager = new NPCManager(this.scene, this.krathongSystem);
    this.particleManager = new ParticleManager(this.scene, audioManager);
  }

  switchCameraZone(zoneKey) {
    if (!this.cameraPresets[zoneKey]) return;
    this.currentZone = zoneKey;

    const preset = this.cameraPresets[zoneKey];
    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.copy(preset.pos);

    this.targetStart.copy(this.controls.target);
    this.targetEnd.copy(preset.target);

    this.cameraTransitionAlpha = 0.0;
    this.isTransitioningCamera = true;

    document.querySelectorAll('.zone-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-zone') === zoneKey);
    });
  }

  setupUIEvents() {
    document.querySelectorAll('.zone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const zone = btn.getAttribute('data-zone');
        this.switchCameraZone(zone);
      });
    });

    document.getElementById('fireworks-btn').addEventListener('click', () => {
      this.particleManager.launchFirework();
      setTimeout(() => {
        this.particleManager.launchFirework();
      }, 350);
    });

    document.getElementById('lantern-btn').addEventListener('click', () => {
      this.particleManager.releaseLantern();
    });

    const uiContainer = document.getElementById('ui-container');
    const cinemaExitHint = document.getElementById('cinema-exit-hint');
    const cinemaToggleBtn = document.getElementById('cinema-btn');

    const enterCinemaMode = () => {
      uiContainer.style.opacity = '0';
      uiContainer.style.pointerEvents = 'none';
      cinemaExitHint.style.display = 'block';
    };

    const exitCinemaMode = () => {
      uiContainer.style.opacity = '1';
      uiContainer.style.pointerEvents = 'auto';
      cinemaExitHint.style.display = 'none';
    };

    cinemaToggleBtn.addEventListener('click', enterCinemaMode);
    cinemaExitHint.addEventListener('click', exitCinemaMode);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        exitCinemaMode();
        this.closeAllModals();
      }
    });

    const mixerDrawer = document.getElementById('sound-mixer-drawer');
    const mixerToggleBtn = document.getElementById('sound-toggle-btn');
    const closeMixerBtn = document.getElementById('close-mixer-btn');
    const masterAudioBtn = document.getElementById('master-audio-btn');

    mixerToggleBtn.addEventListener('click', () => {
      mixerDrawer.classList.toggle('open');
    });

    closeMixerBtn.addEventListener('click', () => {
      mixerDrawer.classList.remove('open');
    });

    masterAudioBtn.addEventListener('click', async () => {
      const isNowPlaying = audioManager.togglePlay();
      masterAudioBtn.textContent = isNowPlaying
        ? (getLang() === 'th' ? "🔊 กำลังเล่นเสียงบรรยากาศสด" : "🔊 Live Atmosphere Playing")
        : (getLang() === 'th' ? "คลิกเพื่อเปิดเสียงดนตรีสดและบรรยากาศ" : "Click to start live music & audio");
    });

    ['water', 'music', 'fair', 'fx'].forEach(layer => {
      const slider = document.getElementById(`slider-${layer}`);
      if (slider) {
        slider.addEventListener('input', (e) => {
          audioManager.setLayerVolume(layer, parseFloat(e.target.value));
        });
      }
    });

    const krathongModal = document.getElementById('krathong-modal');
    const openStudioBtn = document.getElementById('create-krathong-btn');
    const closeStudioBtn = document.getElementById('close-studio-btn');
    const launchKrathongBtn = document.getElementById('launch-krathong-action-btn');

    openStudioBtn.addEventListener('click', () => {
      krathongModal.classList.add('open');
    });

    closeStudioBtn.addEventListener('click', () => {
      krathongModal.classList.remove('open');
    });

    document.querySelectorAll('.choice-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const group = pill.closest('.choice-pills');
        group.querySelectorAll('.choice-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');

        const optType = pill.getAttribute('data-opt');
        const optVal = pill.getAttribute('data-val');
        this.studioConfig[optType] = optVal;
      });
    });

    launchKrathongBtn.addEventListener('click', () => {
      const wishText = document.getElementById('wish-input').value;
      this.krathongSystem.spawnUserKrathong(this.studioConfig, wishText);

      krathongModal.classList.remove('open');
      this.switchCameraZone('river');

      setTimeout(() => {
        this.particleManager.launchFirework(0, -20);
        this.particleManager.releaseLantern(0, -8);
      }, 600);
    });

    const infoModal = document.getElementById('info-modal');
    const infoBtn = document.getElementById('info-btn');
    const closeInfoBtn = document.getElementById('close-info-btn');

    infoBtn.addEventListener('click', () => {
      infoModal.classList.add('open');
    });

    closeInfoBtn.addEventListener('click', () => {
      infoModal.classList.remove('open');
    });
  }

  closeAllModals() {
    document.querySelectorAll('.center-modal-overlay').forEach(m => m.classList.remove('open'));
    document.getElementById('sound-mixer-drawer').classList.remove('open');
  }

  setupBilingual() {
    const langBtn = document.getElementById('lang-toggle-btn');
    langBtn.addEventListener('click', () => {
      toggleLang();
      const masterAudioBtn = document.getElementById('master-audio-btn');
      if (masterAudioBtn) {
        masterAudioBtn.textContent = audioManager.isPlaying
          ? (getLang() === 'th' ? "🔊 กำลังเล่นเสียงบรรยากาศสด" : "🔊 Live Atmosphere Playing")
          : (getLang() === 'th' ? "คลิกเพื่อเปิดเสียงดนตรีสดและบรรยากาศ" : "Click to start live music & audio");
      }
    });
    updateDOMTranslations();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    if (this.isTransitioningCamera) {
      this.cameraTransitionAlpha += delta * 1.4;
      if (this.cameraTransitionAlpha >= 1.0) {
        this.cameraTransitionAlpha = 1.0;
        this.isTransitioningCamera = false;
      }
      const t = this.cameraTransitionAlpha;
      const smoothT = t * t * (3 - 2 * t);

      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, smoothT);
      this.controls.target.lerpVectors(this.targetStart, this.targetEnd, smoothT);
    }

    this.controls.update();

    if (this.environment) this.environment.update(delta, time);
    if (this.krathongSystem) this.krathongSystem.update(delta, time);
    if (this.npcManager) this.npcManager.update(delta, time);
    if (this.particleManager) this.particleManager.update(delta, time);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new LoyKrathongApp();
});
