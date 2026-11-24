/* ===================================================================
   krathong.js - 3D Modular Krathong & Strict River Water Boundaries
   Fix:
   - Krathongs are strictly confined to river water (Z <= -14.0)
   - NEVER spawn or float onto the wooden pier or embankment!
   - Follows water wave ripples with realistic tilt and candlelight reflection
   =================================================================== */

export class KrathongSystem {
  constructor(scene) {
    this.scene = scene;
    this.ambientKrathongs = [];
    this.userKrathongs = [];

    // Water level reference
    this.waterBaseY = -0.05;

    // Materials
    this.materials = {
      bananaTrunk: new THREE.MeshLambertMaterial({ color: 0x4e6e28, roughness: 0.8 }),
      bananaTrunkTop: new THREE.MeshLambertMaterial({ color: 0xb5c99a, roughness: 0.9 }),
      breadBase: new THREE.MeshLambertMaterial({ color: 0xc49a45, roughness: 0.9 }),
      iceBase: new THREE.MeshLambertMaterial({ color: 0x80deea, roughness: 0.2, transparent: true, opacity: 0.85 }),

      bananaLeaf: new THREE.MeshLambertMaterial({ color: 0x2e7d32, roughness: 0.55 }),
      pinkLotusLeaf: new THREE.MeshLambertMaterial({ color: 0xf06292, roughness: 0.5 }),
      pandanLeaf: new THREE.MeshLambertMaterial({ color: 0x1b5e20, roughness: 0.5 }),

      marigold: new THREE.MeshLambertMaterial({ color: 0xffb300, roughness: 0.6, emissive: 0xff8f00, emissiveIntensity: 0.25 }),
      whiteLotus: new THREE.MeshLambertMaterial({ color: 0xfff9c4, roughness: 0.55 }),
      orchid: new THREE.MeshLambertMaterial({ color: 0xba68c8, roughness: 0.5 }),

      candleWax: new THREE.MeshLambertMaterial({ color: 0xfff176, roughness: 0.4 }),
      candleFlame: new THREE.MeshBasicMaterial({ color: 0xffa000 }),
      candleFlameCore: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      incenseStick: new THREE.MeshLambertMaterial({ color: 0x5d4037 }),
      incenseEmber: new THREE.MeshBasicMaterial({ color: 0xff3d00 })
    };

    this.initAmbientFlock();
  }

  createKrathong(config = {}) {
    const {
      base = 'banana',
      petal = 'lotus',
      flower = 'marigold',
      candleType = 'warm',
      scale = 1.0,
      hasPointLight = true
    } = config;

    const group = new THREE.Group();
    group.castShadow = true;

    // 1. Base Geometry
    let baseMesh;
    if (base === 'bread') {
      const geo = new THREE.CylinderGeometry(0.85, 0.9, 0.32, 16);
      baseMesh = new THREE.Mesh(geo, this.materials.breadBase);
    } else if (base === 'ice') {
      const geo = new THREE.CylinderGeometry(0.85, 0.85, 0.32, 12);
      baseMesh = new THREE.Mesh(geo, this.materials.iceBase);
    } else {
      const geo = new THREE.CylinderGeometry(0.85, 0.85, 0.32, 20);
      baseMesh = new THREE.Mesh(geo, [
        this.materials.bananaTrunk,
        this.materials.bananaTrunkTop,
        this.materials.bananaTrunk
      ]);
    }
    baseMesh.position.y = 0.16;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Folded Lotus Leaf Petals
    let petalMat = this.materials.bananaLeaf;
    if (petal === 'pink') petalMat = this.materials.pinkLotusLeaf;
    if (petal === 'pandan') petalMat = this.materials.pandanLeaf;

    const outerCount = 14;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2;
      const petalMesh = this.createPetalMesh(petalMat, 0.36, 0.52);
      petalMesh.position.set(Math.cos(angle) * 0.82, 0.26, Math.sin(angle) * 0.82);
      petalMesh.rotation.y = -angle + Math.PI / 2;
      petalMesh.rotation.x = 0.35;
      petalMesh.castShadow = true;
      group.add(petalMesh);
    }

    const innerCount = 10;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2 + 0.2;
      const petalMesh = this.createPetalMesh(petalMat, 0.3, 0.42);
      petalMesh.position.set(Math.cos(angle) * 0.54, 0.32, Math.sin(angle) * 0.54);
      petalMesh.rotation.y = -angle + Math.PI / 2;
      petalMesh.rotation.x = 0.22;
      petalMesh.castShadow = true;
      group.add(petalMesh);
    }

    // 3. Flower Ring
    let flowerMat = this.materials.marigold;
    if (flower === 'lotus') flowerMat = this.materials.whiteLotus;
    if (flower === 'orchid') flowerMat = this.materials.orchid;

    const flowerCount = 6;
    for (let i = 0; i < flowerCount; i++) {
      const angle = (i / flowerCount) * Math.PI * 2;
      const flowerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 8),
        flowerMat
      );
      flowerMesh.scale.set(1.1, 0.65, 1.1);
      flowerMesh.position.set(Math.cos(angle) * 0.32, 0.38, Math.sin(angle) * 0.32);
      flowerMesh.castShadow = true;
      group.add(flowerMesh);
    }

    // 4. Center Incense Sticks (3 sticks)
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.65, 6),
        this.materials.incenseStick
      );
      stick.position.set(i * 0.06 - 0.08, 0.6, 0.06);
      stick.rotation.z = i * 0.08;
      stick.rotation.x = -0.1;
      group.add(stick);

      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        this.materials.incenseEmber
      );
      ember.position.set(stick.position.x, 0.92, stick.position.z - 0.03);
      group.add(ember);
    }

    // 5. Candle with flame
    const candleWax = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.42, 8),
      this.materials.candleWax
    );
    candleWax.position.set(0.08, 0.52, -0.04);
    candleWax.castShadow = true;
    group.add(candleWax);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.16, 8),
      this.materials.candleFlame
    );
    flame.position.set(0.08, 0.78, -0.04);
    group.add(flame);

    const flameCore = new THREE.Mesh(
      new THREE.ConeGeometry(0.026, 0.1, 8),
      this.materials.candleFlameCore
    );
    flameCore.position.set(0.08, 0.77, -0.04);
    group.add(flameCore);

    // Warm Point Light casting shadow and specular on water
    let light = null;
    if (hasPointLight) {
      const lightColor = candleType === 'gold' ? 0xffb74d : 0xffa040;
      light = new THREE.PointLight(lightColor, 1.4, 6.0, 2.0);
      light.position.set(0.08, 0.9, -0.04);
      group.add(light);
    }

    group.scale.set(scale, scale, scale);

    return {
      mesh: group,
      flame: flame,
      light: light
    };
  }

  createPetalMesh(material, width, height) {
    const geom = new THREE.ConeGeometry(width, height, 4);
    geom.scale(1.0, 1.0, 0.35);
    const mesh = new THREE.Mesh(geom, material);
    mesh.rotation.y = Math.PI / 4;
    return mesh;
  }

  initAmbientFlock() {
    // 65 Ambient glowing krathongs
    // STRICT WATER ZONE: X from -65 to +65, Z strictly from -15.0 to -55.0 (NEVER >= -13.5)
    const count = 65;
    for (let i = 0; i < count; i++) {
      const baseTypes = ['banana', 'banana', 'bread', 'ice'];
      const petalTypes = ['lotus', 'pink', 'pandan'];
      const flowerTypes = ['marigold', 'lotus', 'orchid'];

      const kr = this.createKrathong({
        base: baseTypes[Math.floor(Math.random() * baseTypes.length)],
        petal: petalTypes[Math.floor(Math.random() * petalTypes.length)],
        flower: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
        scale: 0.65 + Math.random() * 0.35,
        hasPointLight: i < 12
      });

      // STRICTLY IN WATER
      kr.mesh.position.x = (Math.random() - 0.5) * 120;
      kr.mesh.position.y = this.waterBaseY;
      kr.mesh.position.z = -15.5 - Math.random() * 38; // Deep in the water, away from pier

      kr.speed = 0.35 + Math.random() * 0.45;
      kr.bobPhase = Math.random() * Math.PI * 2;
      kr.rotSpeed = (Math.random() - 0.5) * 0.18;

      this.scene.add(kr.mesh);
      this.ambientKrathongs.push(kr);
    }
  }

  spawnUserKrathong(config, wishText = '') {
    const kr = this.createKrathong({
      ...config,
      scale: 1.15,
      hasPointLight: true
    });

    // Start STRICTLY in the water at the front tip of the pier
    // Pier ends at z = -12.5, so water edge is z = -14.0!
    kr.mesh.position.set(0, this.waterBaseY, -14.2);
    kr.speed = 0.5;
    kr.bobPhase = 0;
    kr.rotSpeed = 0.05;
    kr.wishText = wishText;
    kr.isUser = true;

    // Glowing Sacred Aura on water
    const auraGeo = new THREE.RingGeometry(0.75, 1.4, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.rotation.x = Math.PI / 2;
    aura.position.y = 0.02;
    kr.mesh.add(aura);

    this.scene.add(kr.mesh);
    this.userKrathongs.push(kr);
    return kr;
  }

  update(delta, time) {
    // Update ambient krathongs
    for (let i = 0; i < this.ambientKrathongs.length; i++) {
      const kr = this.ambientKrathongs[i];

      // Drift along river flow (+X direction)
      kr.mesh.position.x += kr.speed * delta;
      if (kr.mesh.position.x > 68) {
        kr.mesh.position.x = -68;
        kr.mesh.position.z = -15.5 - Math.random() * 38;
      }

      // STRICT COLLISION CHECK: NEVER LET KRATHONG ENTER PIER OR LAND!
      if (kr.mesh.position.z > -14.2) {
        kr.mesh.position.z = -14.5;
      }

      // Realistic wave bobbing
      const wave = Math.sin(kr.mesh.position.x * 0.18 + time * 1.8) * 0.12 +
                   Math.cos(kr.mesh.position.z * 0.22 + time * 1.4) * 0.08;
      kr.mesh.position.y = this.waterBaseY + wave;
      kr.mesh.rotation.z = Math.sin(time * 1.8 + kr.bobPhase) * 0.05;
      kr.mesh.rotation.x = Math.cos(time * 1.6 + kr.bobPhase) * 0.04;
      kr.mesh.rotation.y += kr.rotSpeed * delta;

      // Candle flicker
      if (kr.flame) {
        const flicker = 0.85 + Math.sin(time * 14 + kr.bobPhase) * 0.15;
        kr.flame.scale.set(flicker, flicker * 1.1, flicker);
      }
      if (kr.light) {
        kr.light.intensity = 1.1 + Math.sin(time * 12 + kr.bobPhase) * 0.35;
      }
    }

    // Update user krathongs
    for (let i = 0; i < this.userKrathongs.length; i++) {
      const kr = this.userKrathongs[i];

      // Drift out into deeper water (-Z) and downstream (+X)
      kr.mesh.position.z -= delta * 0.6;
      kr.mesh.position.x += kr.speed * delta;

      // STRICT BOUNDARY: Never allow onto land or pier
      if (kr.mesh.position.z > -14.0) {
        kr.mesh.position.z = -14.2;
      }

      const wave = Math.sin(kr.mesh.position.x * 0.18 + time * 1.8) * 0.12 +
                   Math.cos(kr.mesh.position.z * 0.22 + time * 1.4) * 0.08;
      kr.mesh.position.y = this.waterBaseY + wave;
      kr.mesh.rotation.y += 0.08 * delta;

      if (kr.light) {
        kr.light.intensity = 1.8 + Math.sin(time * 16) * 0.4;
      }
    }
  }
}
