/* ===================================================================
   environment.js - Perfectly Balanced Luminous Blue Environment
   Vibrant, rich radiant colors with clear contrast and details
   =================================================================== */

export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.waterMesh = null;
    this.waterVerticesOriginal = [];
    this.lanternLights = [];

    this.setupLighting();
    this.setupSkyAndMoon();
    this.setupRiver();
    this.setupZoneArchitecture();
    this.setupVegetation();
  }

  setupLighting() {
    // 1. Nighttime Warm Ambient Sky & Earth Bounce (Reduced for romantic nighttime festival mood)
    const hemiLight = new THREE.HemisphereLight(0xd4a373, 0x1f140e, 0.55);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 2. Soft Night Ambient Fill
    const ambientLight = new THREE.AmbientLight(0x4a3b32, 0.45);
    this.scene.add(ambientLight);

    // 3. Gentle Golden Moonlight
    const moonLight = new THREE.DirectionalLight(0xffe0b2, 0.65);
    moonLight.position.set(-30, 55, -60);
    this.scene.add(moonLight);

    // 4. Subtle Warm Lantern Accent
    const warmFill = new THREE.DirectionalLight(0xff9800, 0.4);
    warmFill.position.set(30, 40, 35);
    this.scene.add(warmFill);
  }

  setupSkyAndMoon() {
    // 1. Huge Radiant Full Moon
    const moonGeo = new THREE.SphereGeometry(7.5, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-28, 52, -75);
    this.scene.add(moon);

    // Moon Atmospheric Glow Halo
    const haloGeo = new THREE.RingGeometry(7.5, 24.0, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x64b5f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(moon.position);
    halo.position.z += 0.5;
    halo.lookAt(0, 10, 20);
    this.scene.add(halo);

    // 2. Sparkling Stars
    const starCount = 2600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 130 + Math.random() * 40;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 8;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0.95
    });
    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);
  }

  setupRiver() {
    // Optimized River Geometry (48x28 segments - reduces vertex computations by 75%)
    const riverWidth = 160;
    const riverLength = 70;
    const segmentsX = 48;
    const segmentsZ = 28;

    const riverGeo = new THREE.PlaneGeometry(riverWidth, riverLength, segmentsX, segmentsZ);
    riverGeo.rotateX(-Math.PI / 2);

    const riverMat = new THREE.MeshPhongMaterial({
      color: 0x37474f,
      specular: 0xffd54f,
      shininess: 60,
      flatShading: false
    });

    this.waterMesh = new THREE.Mesh(riverGeo, riverMat);
    this.waterMesh.position.set(0, -0.25, -36);
    this.scene.add(this.waterMesh);

    // Cache original vertices
    const posAttr = riverGeo.attributes.position;
    this.waterVerticesOriginal = [];
    for (let i = 0; i < posAttr.count; i++) {
      this.waterVerticesOriginal.push({
        x: posAttr.getX(i),
        y: posAttr.getY(i),
        z: posAttr.getZ(i)
      });
    }

    // Riverbed bottom
    const bedGeo = new THREE.PlaneGeometry(riverWidth, riverLength);
    bedGeo.rotateX(-Math.PI / 2);
    const bed = new THREE.Mesh(bedGeo, new THREE.MeshBasicMaterial({ color: 0x051830 }));
    bed.position.set(0, -2.8, -36);
    this.scene.add(bed);
  }

  setupZoneArchitecture() {
    // Warm Terracotta & Earth Festival Palette (matching user photo)
    const stonePavedMat = new THREE.MeshLambertMaterial({ color: 0xbcaaa4 }); // Sandy warm plaza
    const centralAvenueMat = new THREE.MeshLambertMaterial({ color: 0xa1887f }); // Terracotta clay path
    const marketPavedMat = new THREE.MeshLambertMaterial({ color: 0xbcaaa4 }); // Warm sand
    const stagePavedMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 }); // Terracotta wood
    const templePavedMat = new THREE.MeshLambertMaterial({ color: 0xbcaaa4 }); // Warm sand courtyard
    const woodDeckMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 }); // Warm wood pier
    const stoneRailingMat = new THREE.MeshLambertMaterial({ color: 0xa1887f });
    const goldMat = new THREE.MeshPhongMaterial({ color: 0xffb300, specular: 0xffe082, shininess: 60 });

    // ================= MAIN FESTIVAL GROUND =================
    const mainGround = new THREE.Mesh(new THREE.BoxGeometry(110, 1.2, 44), stonePavedMat);
    mainGround.position.set(0, -0.6, 17);
    this.scene.add(mainGround);

    // ================= CENTRAL PROMENADE =================
    const centralAvenue = new THREE.Mesh(new THREE.BoxGeometry(10, 0.08, 38), centralAvenueMat);
    centralAvenue.position.set(0, 0.04, 15);
    this.scene.add(centralAvenue);

    // ================= ZONE 1: WATERFRONT PIER & PROMENADE =================
    // 1. Stone Balustrade Railing along the river bank (z = -4.0)
    for (let x = -50; x <= 50; x += 3.5) {
      if (Math.abs(x) > 6.0) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.0, 8), stoneRailingMat);
        post.position.set(x, 0.5, -4.0);
        this.scene.add(post);

        const rail = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.14), stoneRailingMat);
        rail.position.set(x + 1.75, 0.85, -4.0);
        this.scene.add(rail);
      }
    }

    // 2. Central Wooden Floating Pier (Strictly z: -4.0 to -12.5)
    const pier = new THREE.Mesh(new THREE.BoxGeometry(13, 0.35, 8.5), woodDeckMat);
    pier.position.set(0, 0.1, -8.25);
    this.scene.add(pier);

    // Wooden stairs
    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(11, 0.16, 0.7), woodDeckMat);
      step.position.set(0, 0.25 - s * 0.08, -4.2 + s * 0.6);
      this.scene.add(step);
    }

    // Corner bollards
    [[-6.2, -12.2], [6.2, -12.2], [-6.2, -4.5], [6.2, -4.5]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.2, 8), woodDeckMat);
      post.position.set(px, 0.6, pz);
      this.scene.add(post);
    });

    // Waterfront Royal Thai Pavilion
    this.createThaiPavilion(-16, 0.0, -1.5);

    // ================= ZONE 2: RETRO MARKET PLAZA =================
    const marketPlaza = new THREE.Mesh(new THREE.BoxGeometry(28, 0.08, 14), marketPavedMat);
    marketPlaza.position.set(-22, 0.04, 12);
    this.scene.add(marketPlaza);

    this.createZoneArchway(-8, 0.0, 12, "ตลาดน้ำย้อนยุค", 0xb71c1c);
    this.createMarketStringLights(-22, 3.8, 12);

    // ================= ZONE 3: CULTURAL PERFORMANCE PLAZA =================
    const stagePlaza = new THREE.Mesh(new THREE.BoxGeometry(24, 0.08, 16), stagePavedMat);
    stagePlaza.position.set(25, 0.04, 11);
    this.scene.add(stagePlaza);

    for (let r = 0; r < 2; r++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 8.0), woodDeckMat);
      bench.position.set(16 - r * 2.2, 0.25, 11);
      this.scene.add(bench);
    }

    // ================= ZONE 4: CARNIVAL GAMES PLAZA =================
    const gamesPlaza = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 13), stonePavedMat);
    gamesPlaza.position.set(-21, 0.04, 28);
    this.scene.add(gamesPlaza);

    this.createCarnivalPennants(-21, 4.0, 28);
    this.createZoneArchway(-6, 0.0, 28, "ซุ้มเกมงานวัด", 0x6a1b9a);

    // ================= ZONE 5: TEMPLE MERIT COURTYARD =================
    const meritPlaza = new THREE.Mesh(new THREE.BoxGeometry(24, 0.08, 13), templePavedMat);
    meritPlaza.position.set(25, 0.04, 28);
    this.scene.add(meritPlaza);

    this.createTempleWall(25, 0.0, 28, 24, 13);

    // ================= MAIN PROMENADE LANTERN POLES =================
    const poleZ = [0, 8, 16, 24, 32];
    poleZ.forEach(z => {
      this.createLanternPole(-5.5, 0.0, z);
      this.createLanternPole(5.5, 0.0, z);
    });
  }

  createThaiPavilion(x, y, z) {
    const pavGroup = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
    const goldMat = new THREE.MeshPhongMaterial({ color: 0xffb300, specular: 0xffe082, shininess: 60 });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xb71c1c });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(7, 0.4, 7), woodMat);
    deck.position.y = 0.2;
    pavGroup.add(deck);

    const pilGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8);
    [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([px, pz]) => {
      const pil = new THREE.Mesh(pilGeo, woodMat);
      pil.position.set(px, 1.9, pz);
      pavGroup.add(pil);
    });

    const roofBase = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.0, 4), roofMat);
    roofBase.position.y = 4.4;
    roofBase.rotation.y = Math.PI / 4;
    pavGroup.add(roofBase);

    const roofTop = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 4), roofMat);
    roofTop.position.y = 5.6;
    roofTop.rotation.y = Math.PI / 4;
    pavGroup.add(roofTop);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.6, 8), goldMat);
    spire.position.y = 7.0;
    pavGroup.add(spire);

    const pLight = new THREE.PointLight(0xffb74d, 1.8, 14);
    pLight.position.set(0, 3.2, 0);
    pavGroup.add(pLight);
    this.lanternLights.push(pLight);

    pavGroup.position.set(x, y, z);
    this.scene.add(pavGroup);
  }

  createZoneArchway(x, y, z, labelText, color) {
    const arch = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
    const signMat = new THREE.MeshLambertMaterial({ color });

    [-1.6, 1.6].forEach(px => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.6, 8), woodMat);
      post.position.set(px, 1.8, 0);
      arch.add(post);
    });

    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 0.3), woodMat);
    beam.position.y = 3.5;
    arch.add(beam);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.75, 0.1), signMat);
    sign.position.y = 3.2;
    arch.add(sign);

    [-1.4, 1.4].forEach(lx => {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffb300 })
      );
      lantern.position.set(lx, 2.8, 0);
      arch.add(lantern);
    });

    arch.position.set(x, y, z);
    this.scene.add(arch);
  }

  createMarketStringLights(x, y, z) {
    const group = new THREE.Group();
    [-4, 0, 4].forEach(offsetZ => {
      for (let i = 0; i < 9; i++) {
        const lx = -12 + i * 3.0;
        const ly = y - Math.sin((i / 8) * Math.PI) * 0.4;
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xfff59d })
        );
        bulb.position.set(lx, ly, offsetZ);
        group.add(bulb);
      }
    });

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createCarnivalPennants(x, y, z) {
    const group = new THREE.Group();
    const colors = [0xff1744, 0xffea00, 0x00e676, 0x2979ff, 0xd500f9];

    for (let r = -3; r <= 3; r += 3) {
      for (let i = 0; i < 12; i++) {
        const px = -12 + i * 2.2;
        const py = y - Math.sin((i / 11) * Math.PI) * 0.35;
        const flag = new THREE.Mesh(
          new THREE.ConeGeometry(0.25, 0.4, 3),
          new THREE.MeshLambertMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide })
        );
        flag.rotation.x = Math.PI;
        flag.position.set(px, py, r);
        group.add(flag);
      }
    }

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createTempleWall(x, y, z, width, length) {
    const wallGroup = new THREE.Group();
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const goldMat = new THREE.MeshPhongMaterial({ color: 0xffb300, specular: 0xffe082, shininess: 50 });

    const hw = width / 2;
    const hl = length / 2;

    const segments = [
      { w: width, l: 0.3, px: 0, pz: -hl },
      { w: width, l: 0.3, px: 0, pz: hl },
      { w: 0.3, l: length, px: -hw, pz: 0 },
      { w: 0.3, l: length, px: hw, pz: 0 }
    ];

    segments.forEach(({ w, l, px, pz }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, l), wallMat);
      wall.position.set(px, 0.35, pz);
      wallGroup.add(wall);
    });

    [[-hw, -hl], [hw, -hl], [-hw, hl], [hw, hl]].forEach(([cx, cz]) => {
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 6), goldMat);
      bud.position.set(cx, 0.95, cz);
      wallGroup.add(bud);
    });

    wallGroup.position.set(x, y, z);
    this.scene.add(wallGroup);
  }

  createLanternPole(x, y, z) {
    // Tall wood pole with glowing yellow orb and hanging triangular pennants (Matching user reference photo)
    const poleGroup = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 }); // Dark wood pole
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xfff59d }); // Glowing round globe light

    // 1. Tall vertical wood pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 5.8, 8), woodMat);
    pole.position.y = 2.9;
    poleGroup.add(pole);

    // 2. Round globe lantern atop pole (exact look in reference image)
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), orbMat);
    globe.position.y = 5.9;
    poleGroup.add(globe);

    // 3. Hanging triangular pennant flags on pole
    const flagColors = [0x00897b, 0xd84315, 0xfbc02d, 0x00acc1];
    const flagGeo = new THREE.ConeGeometry(0.28, 0.65, 3);
    const flagMat = new THREE.MeshLambertMaterial({
      color: flagColors[Math.floor(Math.abs(x * 3 + z * 7)) % flagColors.length],
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.rotation.x = Math.PI;
    flag.position.set(0.35, 4.4, 0);
    poleGroup.add(flag);

    const pLight = new THREE.PointLight(0xffecb3, 1.2, 10);
    pLight.position.set(0, 5.8, 0);
    poleGroup.add(pLight);
    this.lanternLights.push(pLight);

    poleGroup.position.set(x, y, z);
    this.scene.add(poleGroup);
  }

  setupVegetation() {
    // Richer variety of Thai festival trees: Coconut palms, flowering Frangipani (ต้นลั่นทม), Banana groves
    const treePositions = [
      [-42, 0, -2, 'banana'], [-38, 0, 5, 'palm'], [-45, 0, 20, 'frangipani'],
      [42, 0, -2, 'banana'],  [38, 0, 6, 'palm'],  [44, 0, 20, 'frangipani'],
      [-44, 0, 32, 'palm'],   [44, 0, 32, 'frangipani'],
      [-2, 0, -2, 'flower_pot'], [2, 0, -2, 'flower_pot']
    ];

    treePositions.forEach(([tx, ty, tz, type]) => {
      if (type === 'banana') {
        this.createBananaTree(tx, ty, tz);
      } else if (type === 'palm') {
        this.createCoconutPalm(tx, ty, tz);
      } else if (type === 'frangipani') {
        this.createFrangipaniTree(tx, ty, tz);
      } else if (type === 'flower_pot') {
        this.createFlowerShrub(tx, ty, tz);
      }
    });
  }

  createBananaTree(x, y, z) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7cb342 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x388e3c, side: THREE.DoubleSide });

    // Multi-stem tropical banana cluster
    const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 3.2, 8), trunkMat);
    trunk1.position.y = 1.6;
    group.add(trunk1);

    const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.2, 8), trunkMat);
    trunk2.position.set(0.35, 1.1, 0.2);
    trunk2.rotation.z = -0.15;
    group.add(trunk2);

    // Arching banana fronds with natural droop
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const leafGeo = new THREE.PlaneGeometry(0.9, 3.2, 4, 8);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0, 3.2, 0);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.65;
      group.add(leaf);
    }

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  createCoconutPalm(x, y, z) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 });
    const frondMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });
    const nutMat = new THREE.MeshLambertMaterial({ color: 0x558b2f });

    // Gracefully curved tall trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 7.0, 8), trunkMat);
    trunk.position.set(0.4, 3.5, 0);
    trunk.rotation.z = -0.12;
    group.add(trunk);

    // Green coconut cluster under fronds
    for (let c = 0; c < 4; c++) {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), nutMat);
      nut.position.set(0.7 + (c % 2) * 0.2, 6.6, -0.1 + Math.floor(c / 2) * 0.25);
      group.add(nut);
    }

    // Arching palm fronds
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(1.0, 4.2, 4);
      frondGeo.scale(1.0, 1.0, 0.15);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0.8, 6.9, 0);
      frond.rotation.y = angle;
      frond.rotation.x = 0.85;
      group.add(frond);
    }

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  createFrangipaniTree(x, y, z) {
    const group = new THREE.Group();
    const barkMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const flowerMat = new THREE.MeshBasicMaterial({ color: 0xfff9c4 });

    // Sculpted branching trunk
    const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.4, 8), barkMat);
    baseTrunk.position.y = 1.2;
    group.add(baseTrunk);

    // Foliage canopy spheres
    const canopyCoords = [
      [0, 2.8, 0, 1.5],
      [-0.8, 2.5, 0.4, 1.2],
      [0.8, 2.5, -0.4, 1.2],
      [0, 3.3, 0.3, 1.1]
    ];

    canopyCoords.forEach(([cx, cy, cz, cr]) => {
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(cr, 8, 8), foliageMat);
      foliage.position.set(cx, cy, cz);
      group.add(foliage);

      // White-yellow fragrant blossom clusters
      for (let f = 0; f < 5; f++) {
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), flowerMat);
        const theta = Math.random() * Math.PI * 2;
        blossom.position.set(
          cx + Math.cos(theta) * cr * 0.95,
          cy + (Math.random() - 0.2) * cr,
          cz + Math.sin(theta) * cr * 0.95
        );
        group.add(blossom);
      }
    });

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  createFlowerShrub(x, y, z) {
    const group = new THREE.Group();
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.25, 0.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x8d6e63 })
    );
    pot.position.y = 0.25;
    group.add(pot);

    const shrub = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x43a047 })
    );
    shrub.position.y = 0.65;
    group.add(shrub);

    // Golden Marigolds in pot
    const marigoldMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
    for (let m = 0; m < 5; m++) {
      const a = (m / 5) * Math.PI * 2;
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), marigoldMat);
      flower.position.set(Math.cos(a) * 0.3, 0.8, Math.sin(a) * 0.3);
      group.add(flower);
    }

    group.position.set(x, y, z);
    this.scene.add(group);
  }

  update(delta, time) {
    if (this.waterMesh) {
      const posAttr = this.waterMesh.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const v = this.waterVerticesOriginal[i];
        const wave1 = Math.sin(v.x * 0.18 + time * 1.8) * 0.12;
        const wave2 = Math.cos(v.z * 0.22 + time * 1.4) * 0.08;
        const wave3 = Math.sin((v.x + v.z) * 0.12 + time * 2.2) * 0.05;
        posAttr.setY(i, v.y + wave1 + wave2 + wave3);
      }
      posAttr.needsUpdate = true;
      this.waterMesh.geometry.computeVertexNormals();
    }

    for (let i = 0; i < this.lanternLights.length; i++) {
      const light = this.lanternLights[i];
      light.intensity = 1.2 + Math.sin(time * 9 + i * 2.3) * 0.2;
    }
  }
}
