/* ===================================================================
   particles.js - Realistic Fireworks System & Glowing Sky Lanterns (โคมลอย)
   Features:
   - Interactive Fireworks: Rocket trails, multi-color bursts, gravity & sparkle
   - Interactive Sky Lanterns (โคมลอย): Floating glowing cylinders swaying up to heaven
   =================================================================== */

export class ParticleManager {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.fireworks = [];
    this.skyLanterns = [];

    // Pre-populate ambient floating sky lanterns drifting high above the river
    this.initAmbientLanterns();
  }

  /* ---------------- FIREWORKS SYSTEM ---------------- */
  launchFirework(x = null, z = null) {
    if (this.audioManager) {
      this.audioManager.playFireworkLaunch();
    }

    const startX = x !== null ? x : (Math.random() - 0.5) * 60;
    const startZ = z !== null ? z : -25 - Math.random() * 30;
    const targetY = 28 + Math.random() * 20;

    const colors = [
      0xff1744, 0xffeb3b, 0x00e676, 0x2979ff, 0xd500f9,
      0xff9100, 0x00e5ff, 0xff4081, 0xffea00
    ];
    const burstColor = colors[Math.floor(Math.random() * colors.length)];

    // Rocket head
    const rocketGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const rocketMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const rocket = new THREE.Mesh(rocketGeo, rocketMat);
    rocket.position.set(startX, -0.2, startZ);
    this.scene.add(rocket);

    this.fireworks.push({
      type: 'rocket',
      mesh: rocket,
      vy: 24.0 + Math.random() * 6.0,
      targetY: targetY,
      color: burstColor,
      startX,
      startZ
    });
  }

  createBurst(x, y, z, color) {
    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Spherical burst velocities
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 4.0 + Math.random() * 10.0;

      velocities.push({
        vx: speed * Math.sin(phi) * Math.cos(theta),
        vy: speed * Math.cos(phi),
        vz: speed * Math.sin(phi) * Math.sin(theta)
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.75,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    // Flash light during burst
    const flash = new THREE.PointLight(color, 4.0, 35, 2);
    flash.position.set(x, y, z);
    this.scene.add(flash);

    this.fireworks.push({
      type: 'burst',
      points: particles,
      velocities: velocities,
      flash: flash,
      age: 0,
      maxAge: 1.6
    });
  }

  /* ---------------- SKY LANTERNS (โคมลอย) SYSTEM ---------------- */
  createSkyLanternMesh() {
    const group = new THREE.Group();

    // Cylindrical Rice Paper Body
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      emissive: 0xff8f00,
      emissiveIntensity: 0.85,
      roughness: 0.5,
      side: THREE.DoubleSide
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.95, 12, 1, true), paperMat);
    body.position.y = 0.48;
    group.add(body);

    // Top paper dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), paperMat);
    dome.position.y = 0.95;
    group.add(dome);

    // Bamboo bottom ring wire
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.02, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x4e342e })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    // Glowing Candle Flame inside
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    flame.position.y = 0.25;
    group.add(flame);

    // Internal Glow Point Light
    const light = new THREE.PointLight(0xffa000, 1.4, 7.0, 2);
    light.position.y = 0.35;
    group.add(light);

    return { group, light };
  }

  initAmbientLanterns() {
    // 25 ambient sky lanterns already floating high in the background
    for (let i = 0; i < 25; i++) {
      const { group } = this.createSkyLanternMesh();
      group.scale.set(0.65, 0.65, 0.65);
      group.position.set(
        (Math.random() - 0.5) * 80,
        15 + Math.random() * 35,
        -15 - Math.random() * 55
      );

      this.scene.add(group);
      this.skyLanterns.push({
        group: group,
        vy: 0.4 + Math.random() * 0.3,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.8 + Math.random() * 0.4
      });
    }
  }

  releaseLantern(x = null, z = null) {
    const { group } = this.createSkyLanternMesh();
    group.scale.set(0.9, 0.9, 0.9);

    const startX = x !== null ? x : (Math.random() - 0.5) * 20;
    const startZ = z !== null ? z : -4.0 + (Math.random() - 0.5) * 6;
    group.position.set(startX, 0.6, startZ);

    this.scene.add(group);
    this.skyLanterns.push({
      group: group,
      vy: 1.2 + Math.random() * 0.4, // Ascends from ground
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 1.1
    });
  }

  /* ---------------- UPDATE TICK ---------------- */
  update(delta, time) {
    // 1. Update Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];

      if (fw.type === 'rocket') {
        fw.mesh.position.y += fw.vy * delta;
        if (fw.mesh.position.y >= fw.targetY) {
          this.scene.remove(fw.mesh);
          this.createBurst(fw.mesh.position.x, fw.mesh.position.y, fw.mesh.position.z, fw.color);
          this.fireworks.splice(i, 1);
        }
      } else if (fw.type === 'burst') {
        fw.age += delta;
        const progress = fw.age / fw.maxAge;
        const posAttr = fw.points.geometry.attributes.position;

        for (let p = 0; p < fw.velocities.length; p++) {
          const v = fw.velocities[p];
          v.vy -= 9.8 * delta * 0.4; // gravity
          posAttr.setX(p, posAttr.getX(p) + v.vx * delta);
          posAttr.setY(p, posAttr.getY(p) + v.vy * delta);
          posAttr.setZ(p, posAttr.getZ(p) + v.vz * delta);
        }
        posAttr.needsUpdate = true;

        // Fade out
        fw.points.material.opacity = Math.max(0, 1.0 - progress);
        if (fw.flash) {
          fw.flash.intensity = Math.max(0, 4.0 * (1.0 - progress * 3));
        }

        if (fw.age >= fw.maxAge) {
          this.scene.remove(fw.points);
          if (fw.flash) this.scene.remove(fw.flash);
          this.fireworks.splice(i, 1);
        }
      }
    }

    // 2. Update Sky Lanterns
    for (let i = 0; i < this.skyLanterns.length; i++) {
      const sl = this.skyLanterns[i];
      sl.group.position.y += sl.vy * delta;
      // Gentle horizontal drift and sway
      sl.group.position.x += Math.sin(time * sl.swaySpeed + sl.swayPhase) * 0.25 * delta;
      sl.group.position.z -= 0.35 * delta; // Drift slowly over river toward distance
      sl.group.rotation.z = Math.sin(time * sl.swaySpeed + sl.swayPhase) * 0.05;

      // Wrap around if too high
      if (sl.group.position.y > 65) {
        sl.group.position.y = 8 + Math.random() * 10;
        sl.group.position.z = -5 - Math.random() * 30;
      }
    }
  }
}
