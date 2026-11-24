/* ===================================================================
   characters.js - Stylized Semi-Realistic 3D Characters (Based on Image 1)
   Features:
   - Slender, elegant stylized anatomy matching Image 1:
     * Female: Graceful hourglass waist/hips, slender limbs, contoured calves, flowing wavy stylized hair, elegant Thai Sabai silk & wrap skirt
     * Male: Athletic tapered torso, defined shoulders, contoured limbs, voluminous quiff/pompadour hair, festive Thai silk attire
   - Articulated joints (Pelvis, Spine, Neck, Head, Shoulders, Elbows, Hips, Knees) for natural animation sequences
   - 80 NPCs organized neatly in the 5 distinct festival zones
   =================================================================== */

export class NPCManager {
  constructor(scene, krathongSystem) {
    this.scene = scene;
    this.krathongSystem = krathongSystem;
    this.npcs = [];

    // Realistic warm skin & clothing palettes
    this.palette = {
      skinTones: [0xffe0bd, 0xfad0a5, 0xe8b382, 0xd49b6a, 0xffe5d0],
      hairColors: [0x1c1714, 0x2b201a, 0x3d2b1f, 0x543d2b, 0x7a6552, 0x9e9e9e], // includes elderly silver
      femaleFabrics: [
        { silk: 0xe91e63, skirt: 0x880e4f }, // Lotus magenta
        { silk: 0xffb300, skirt: 0x5d4037 }, // Royal gold
        { silk: 0x00bcd4, skirt: 0x006064 }, // Emerald teal
        { silk: 0xab47bc, skirt: 0x4a148c }, // Orchid purple
        { silk: 0x4caf50, skirt: 0x1b5e20 }, // Jade green
        { silk: 0xff5722, skirt: 0xbf360c }  // Sunset orange
      ],
      maleFabrics: [
        { shirt: 0x1565c0, pants: 0x1a237e }, // Royal blue
        { shirt: 0xffffff, pants: 0x37474f }, // Crisp white
        { shirt: 0xc2185b, pants: 0x212121 }, // Deep ruby
        { shirt: 0xf57f17, pants: 0x4e342e }, // Golden yellow
        { shirt: 0x00897b, pants: 0x263238 }  // Seafoam teal
      ]
    };

    this.initSharedGeometries();
    this.spawnAll80NPCs();
  }

  initSharedGeometries() {
    this.materialsCache = new Map();
  }

  getMaterial(color, isSilk = false) {
    const key = `${color}_${isSilk}`;
    if (!this.materialsCache.has(key)) {
      if (isSilk) {
        this.materialsCache.set(key, new THREE.MeshPhongMaterial({
          color,
          specular: 0xffecb3,
          shininess: 30
        }));
      } else {
        this.materialsCache.set(key, new THREE.MeshLambertMaterial({
          color
        }));
      }
    }
    return this.materialsCache.get(key);
  }

  /* -------------------------------------------------------------
     CREATE STYLIZED 3D ANATOMICAL MODEL (Based on Image 1)
     ------------------------------------------------------------- */
  createStylizedCharacter(config = {}) {
    const {
      gender = 'female',
      age = 'adult',        // 'adult' | 'elderly' | 'student' | 'child' | 'dancer'
      skinColor = 0xffe0bd,
      hairColor = 0x1c1714,
      fabricIndex = 0
    } = config;

    const isFemale = gender === 'female';
    const isChild = age === 'child';
    const scale = isChild ? 0.62 : (age === 'student' ? 0.88 : (isFemale ? 0.96 : 1.04));

    const root = new THREE.Group();
    root.castShadow = true;
    root.receiveShadow = true;

    const skinMat = this.getMaterial(skinColor, 0.55, 0.05);
    const hairMat = this.getMaterial(hairColor, 0.85, 0.1);

    const fabric = isFemale
      ? this.palette.femaleFabrics[fabricIndex % this.palette.femaleFabrics.length]
      : this.palette.maleFabrics[fabricIndex % this.palette.maleFabrics.length];

    const topMat = this.getMaterial(isFemale ? fabric.silk : fabric.shirt, 0.45, 0.2); // Silk sheen
    const botMat = this.getMaterial(isFemale ? fabric.skirt : fabric.pants, 0.6, 0.1);

    // ================= 1. PELVIS (HIP ROOT) =================
    const pelvis = new THREE.Group();
    pelvis.position.y = 1.02 * scale; // Elevated hip center
    root.add(pelvis);

    // Sculpted Hips / Lower Abdomen
    const hipWidth = (isFemale ? 0.26 : 0.24) * scale;
    const hipGeo = new THREE.CylinderGeometry(hipWidth * 0.95, hipWidth * 0.85, 0.22 * scale, 12);
    const hipMesh = new THREE.Mesh(hipGeo, botMat);
    hipMesh.castShadow = true;
    pelvis.add(hipMesh);

    // ================= 2. SPINE & CHEST (CONTOURED TORSO) =================
    const spine = new THREE.Group();
    spine.position.y = 0.11 * scale;
    pelvis.add(spine);

    // Waist (Tapered slender waist like Image 1)
    const waistRadius = (isFemale ? 0.14 : 0.17) * scale;
    const waistGeo = new THREE.CylinderGeometry(waistRadius * 1.15, waistRadius, 0.18 * scale, 12);
    const waistMesh = new THREE.Mesh(waistGeo, topMat);
    waistMesh.position.y = 0.09 * scale;
    waistMesh.castShadow = true;
    spine.add(waistMesh);

    // Ribcage & Chest (Athletic shoulders for male, graceful silhouette for female)
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.18 * scale;
    spine.add(chestGroup);

    const chestTopRadius = (isFemale ? 0.21 : 0.26) * scale;
    const chestGeo = new THREE.CylinderGeometry(chestTopRadius, waistRadius * 1.15, 0.24 * scale, 12);
    const chestMesh = new THREE.Mesh(chestGeo, topMat);
    chestMesh.position.y = 0.12 * scale;
    chestMesh.castShadow = true;
    chestGroup.add(chestMesh);

    // Traditional Thai Sabai Sash draping across the shoulder
    if (isFemale || age === 'dancer') {
      const sabaiSash = new THREE.Mesh(
        new THREE.CylinderGeometry(chestTopRadius * 1.06, waistRadius * 1.08, 0.38 * scale, 8, 1, false, 0, Math.PI * 0.85),
        this.getMaterial(0xffd700, 0.35, 0.4) // Golden embroidery
      );
      sabaiSash.position.y = 0.12 * scale;
      sabaiSash.rotation.y = 0.4;
      chestGroup.add(sabaiSash);
    }

    // ================= 3. NECK & HEAD =================
    const neck = new THREE.Group();
    neck.position.y = 0.24 * scale;
    chestGroup.add(neck);

    const neckGeo = new THREE.CylinderGeometry(0.065 * scale, 0.075 * scale, 0.12 * scale, 8);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = 0.06 * scale;
    neck.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.y = 0.13 * scale;
    neck.add(headGroup);

    // Sculpted stylized head with jawline & chin
    const craniumGeo = new THREE.SphereGeometry(0.155 * scale, 14, 14);
    craniumGeo.scale(1.0, 1.18, 1.05);
    const headMesh = new THREE.Mesh(craniumGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Stylized Sculpted Hair (Based on Image 1)
    if (isFemale) {
      // Flowing wavy hair framing shoulders
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.17 * scale, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
        hairMat
      );
      hairCrown.position.set(0, 0.04 * scale, -0.02 * scale);
      headGroup.add(hairCrown);

      // Left & Right wavy hair strands draping over shoulders
      [-0.14, 0.14].forEach(hx => {
        const strand = new THREE.Mesh(
          new THREE.ConeGeometry(0.08 * scale, 0.38 * scale, 8),
          hairMat
        );
        strand.position.set(hx * scale, -0.1 * scale, 0.03 * scale);
        strand.rotation.z = hx > 0 ? -0.15 : 0.15;
        strand.rotation.x = -0.1;
        headGroup.add(strand);
      });

      // Traditional flower hair ornament
      const flowerPin = new THREE.Mesh(
        new THREE.SphereGeometry(0.045 * scale, 6, 6),
        this.getMaterial(0xffeb3b, 0.3, 0.5)
      );
      flowerPin.position.set(0.14 * scale, 0.08 * scale, 0.08 * scale);
      headGroup.add(flowerPin);

    } else {
      // Male modern quiff / stylized voluminous pompadour
      const hairCrown = new THREE.Mesh(
        new THREE.SphereGeometry(0.172 * scale, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      hairCrown.position.set(0, 0.05 * scale, -0.02 * scale);
      headGroup.add(hairCrown);

      // Swept quiff top volume
      const quiff = new THREE.Mesh(
        new THREE.BoxGeometry(0.14 * scale, 0.09 * scale, 0.18 * scale),
        hairMat
      );
      quiff.position.set(0, 0.15 * scale, 0.04 * scale);
      quiff.rotation.x = -0.3;
      headGroup.add(quiff);
    }

    // ================= 4. CONTOURED ARMS (SHOULDER -> ELBOW -> HAND) =================
    const armRadius = (isFemale ? 0.052 : 0.065) * scale;
    const armLength = 0.28 * scale;
    const shoulderOffset = (isFemale ? 0.22 : 0.28) * scale;

    // Left Arm
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-shoulderOffset, 0.2 * scale, 0);
    chestGroup.add(leftShoulder);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.88, armLength, 8), skinMat);
    leftUpperArm.position.y = -armLength / 2;
    leftUpperArm.castShadow = true;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.y = -armLength;
    leftShoulder.add(leftElbow);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.85, armRadius * 0.7, armLength * 0.95, 8), skinMat);
    leftForearm.position.y = -armLength * 0.475;
    leftForearm.castShadow = true;
    leftElbow.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.045 * scale, 0.08 * scale, 0.06 * scale), skinMat);
    leftHand.position.y = -armLength * 0.95;
    leftElbow.add(leftHand);

    // Right Arm
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(shoulderOffset, 0.2 * scale, 0);
    chestGroup.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius, armRadius * 0.88, armLength, 8), skinMat);
    rightUpperArm.position.y = -armLength / 2;
    rightUpperArm.castShadow = true;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.y = -armLength;
    rightShoulder.add(rightElbow);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(armRadius * 0.85, armRadius * 0.7, armLength * 0.95, 8), skinMat);
    rightForearm.position.y = -armLength * 0.475;
    rightForearm.castShadow = true;
    rightElbow.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.045 * scale, 0.08 * scale, 0.06 * scale), skinMat);
    rightHand.position.y = -armLength * 0.95;
    rightElbow.add(rightHand);

    // ================= 5. CONTOURED LEGS (HIP -> KNEE -> CALF -> FOOT) =================
    const legOffset = (isFemale ? 0.11 : 0.13) * scale;
    const thighRadius = (isFemale ? 0.085 : 0.095) * scale;
    const thighLength = 0.44 * scale;
    const calfLength = 0.46 * scale;

    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(-legOffset, -0.08 * scale, 0);
    pelvis.add(leftHip);

    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius, thighRadius * 0.8, thighLength, 10), botMat);
    leftThigh.position.y = -thighLength / 2;
    leftThigh.castShadow = true;
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -thighLength;
    leftHip.add(leftKnee);

    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius * 0.8, thighRadius * 0.58, calfLength, 10), isFemale ? botMat : skinMat);
    leftCalf.position.y = -calfLength / 2;
    leftCalf.castShadow = true;
    leftKnee.add(leftCalf);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.05 * scale, 0.16 * scale), this.getMaterial(0x212121));
    leftFoot.position.set(0, -calfLength, 0.04 * scale);
    leftKnee.add(leftFoot);

    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(legOffset, -0.08 * scale, 0);
    pelvis.add(rightHip);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius, thighRadius * 0.8, thighLength, 10), botMat);
    rightThigh.position.y = -thighLength / 2;
    rightThigh.castShadow = true;
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -thighLength;
    rightHip.add(rightKnee);

    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(thighRadius * 0.8, thighRadius * 0.58, calfLength, 10), isFemale ? botMat : skinMat);
    rightCalf.position.y = -calfLength / 2;
    rightCalf.castShadow = true;
    rightKnee.add(rightCalf);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.05 * scale, 0.16 * scale), this.getMaterial(0x212121));
    rightFoot.position.set(0, -calfLength, 0.04 * scale);
    rightKnee.add(rightFoot);

    return {
      root,
      pelvis,
      spine,
      chestGroup,
      neck,
      headGroup,
      leftShoulder,
      leftElbow,
      leftHand,
      rightShoulder,
      rightElbow,
      rightHand,
      leftHip,
      leftKnee,
      rightHip,
      rightKnee,
      scale,
      isFemale
    };
  }

  /* -------------------------------------------------------------
     SPAWN EXACTLY 80 NPCS DIVIDED INTO 5 DISTINCT PLAZA ZONES
     ------------------------------------------------------------- */
  spawnAll80NPCs() {
    // =============================================================
    // ZONE 1: WATERFRONT PIER & EMBANKMENT PLAZA (20 NPCs)
    // Strictly stationed on wooden pier (z: -4 to -12) and promenade (z: -4 to 3)
    // NEVER on water!
    // =============================================================

    // 8 Devotees kneeling along the edge of the wooden pier
    for (let i = 0; i < 8; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'female' : 'male',
        age: i === 3 ? 'child' : 'adult',
        fabricIndex: i
      });

      // Positioned along the pier end (z = -11.5) looking into the river
      const px = -4.5 + i * 1.3;
      const pz = -11.5 + (i % 2) * 0.4;
      npc.root.position.set(px, 0.22, pz);
      npc.root.rotation.y = Math.PI; // Face the river
      npc.state = 'kneeling_river';
      npc.animPhase = i * 0.8;

      this.attachKrathongInHands(npc);
      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // 6 People walking down pier steps holding krathongs
    for (let i = 0; i < 6; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'male' : 'female',
        age: i === 0 ? 'elderly' : (i === 1 ? 'student' : 'adult'),
        fabricIndex: i + 2
      });
      const px = -3.0 + i * 1.2;
      const pz = -6.0 - (i % 3) * 1.5;
      npc.root.position.set(px, 0.22, pz);
      npc.root.rotation.y = Math.PI + (Math.random() - 0.5) * 0.3;
      npc.state = 'holding_krathong';
      npc.animPhase = i * 1.1;

      this.attachKrathongInHands(npc);
      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // 6 People standing at the stone promenade railing admiring sky lanterns & fireworks
    for (let i = 0; i < 6; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'female' : 'male',
        fabricIndex: i + 4
      });
      const px = (i < 3 ? -10 : 10) + (i % 3) * 1.6;
      const pz = -3.2;
      npc.root.position.set(px, 0.22, pz);
      npc.root.rotation.y = Math.PI - 0.15;
      npc.state = 'admiring_sky';
      npc.animPhase = i * 0.9;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // =============================================================
    // ZONE 2: RETRO WALKING STREET MARKET (24 NPCs)
    // Stationed at market stalls (x: -36 to -8, z: 6 to 18)
    // =============================================================

    // 6 Market Vendors behind colorful food stalls
    const vendorPos = [
      [-32, 7.8],  // Khanom Krok
      [-22, 7.8],  // Pak Mor
      [-12, 7.8],  // Look Choup
      [-32, 17.8], // Cotton Candy
      [-22, 17.8], // Herbal Drinks
      [-12, 17.8]  // Balloon Cart
    ];
    vendorPos.forEach(([vx, vz], idx) => {
      const npc = this.createStylizedCharacter({
        gender: idx % 2 === 0 ? 'female' : 'male',
        age: 'adult',
        fabricIndex: idx
      });
      npc.root.position.set(vx, 0.0, vz);
      npc.root.rotation.y = 0; // Face shoppers
      npc.state = 'cooking_vendor';
      npc.animPhase = idx * 1.3;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    });

    // 10 Strollers walking along the market boulevard
    for (let i = 0; i < 10; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'male' : 'female',
        age: i % 4 === 0 ? 'child' : (i % 3 === 0 ? 'student' : 'adult'),
        fabricIndex: i + 1
      });
      const startX = -32 + i * 2.8;
      const startZ = 12.8 + (i % 2) * 1.6;
      npc.root.position.set(startX, 0.0, startZ);
      npc.root.rotation.y = i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      npc.state = 'walking_market';
      npc.walkDirection = i % 2 === 0 ? 1 : -1;
      npc.minX = -36;
      npc.maxX = -6;
      npc.animPhase = i * 0.7;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // 8 Patrons sitting at bamboo tables enjoying food and herbal drinks
    for (let i = 0; i < 8; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'female' : 'male',
        age: i % 3 === 0 ? 'elderly' : 'adult',
        fabricIndex: i + 3
      });
      const tableGroup = Math.floor(i / 4);
      const angle = (i % 4) * (Math.PI / 2) + 0.3;
      const tx = -22 + tableGroup * 10;
      const tz = 12.8;
      npc.root.position.set(tx + Math.cos(angle) * 1.3, 0.0, tz + Math.sin(angle) * 1.3);
      npc.root.rotation.y = -angle + Math.PI; // Face the dining table
      npc.state = 'sitting_eat';
      npc.animPhase = i * 0.9;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // =============================================================
    // ZONE 3: CULTURAL PERFORMANCE STAGE (14 NPCs)
    // Stationed at Stage & Audience Plaza (x: 14 to 36, z: 4 to 18)
    // =============================================================

    // 4 Traditional Thai Dancers on Stage (x: 28, z: 9, y: 0.9)
    for (let i = 0; i < 4; i++) {
      const npc = this.createStylizedCharacter({
        gender: 'female',
        age: 'dancer',
        fabricIndex: 1 // Royal gold silk
      });
      npc.root.position.set(26 + (i % 2) * 3.4, 0.9, 7.5 + Math.floor(i / 2) * 2.8);
      npc.root.rotation.y = -Math.PI / 2; // Face the audience
      npc.state = 'thai_dance';
      npc.animPhase = i * 0.75;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // 2 Traditional Thai Musicians (Ranat & Taphon Drum)
    const musicianPos = [[23.5, 0.9, 6.8], [23.5, 0.9, 10.8]];
    musicianPos.forEach(([mx, my, mz], idx) => {
      const npc = this.createStylizedCharacter({
        gender: 'male',
        age: 'adult',
        fabricIndex: idx + 2
      });
      npc.root.position.set(mx, my, mz);
      npc.root.rotation.y = 0;
      npc.state = 'musician';
      npc.animPhase = idx * 0.5;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    });

    // 8 Audience Spectators in front of stage
    for (let i = 0; i < 8; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'female' : 'male',
        age: i % 2 === 0 ? 'student' : 'adult',
        fabricIndex: i + 3
      });
      const ax = 17 - (i % 3) * 1.6;
      const az = 6.5 + Math.floor(i / 3) * 2.2;
      npc.root.position.set(ax, 0.0, az);
      npc.root.rotation.y = Math.PI / 2; // Face the stage
      npc.state = 'watching_clapping';
      npc.animPhase = i * 0.6;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // =============================================================
    // ZONE 4: TEMPLE FAIR CARNIVAL GAMES (12 NPCs)
    // Stationed at Carnival Game Plaza (x: -36 to -6, z: 24 to 34)
    // =============================================================
    const gameStallXs = [-32, -22, -12, -2];
    
    // 4 Game Booth Operators
    gameStallXs.forEach((gx, idx) => {
      const npc = this.createStylizedCharacter({
        gender: 'male',
        age: 'adult',
        fabricIndex: idx + 1
      });
      npc.root.position.set(gx, 0.0, 31.5);
      npc.root.rotation.y = Math.PI; // Face player
      npc.state = 'game_operator';
      npc.animPhase = idx;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    });

    // 8 Players participating in games
    gameStallXs.forEach((gx, idx) => {
      for (let p = 0; p < 2; p++) {
        const npc = this.createStylizedCharacter({
          gender: p === 0 ? 'female' : 'male',
          age: (idx + p) % 2 === 0 ? 'child' : 'adult',
          fabricIndex: idx + p
        });
        npc.root.position.set(gx - 0.5 + p * 1.0, 0.0, 27.5);
        npc.root.rotation.y = 0; // Face game stall
        npc.state = 'playing_game';
        npc.gameIdx = idx; // 0=darts, 1=rings, 2=lucky eggs, 3=star pluck
        npc.animPhase = idx * 1.2 + p * 0.8;

        this.npcs.push(npc);
        this.scene.add(npc.root);
      }
    });

    // =============================================================
    // ZONE 5: SACRED TEMPLE MERIT COURTYARD (10 NPCs)
    // Stationed at Temple Shrine & Luk Nimit (x: 14 to 36, z: 24 to 34)
    // =============================================================

    // 6 Devotees praying & dropping coins at 8 Birthday Buddhas
    for (let i = 0; i < 6; i++) {
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'female' : 'male',
        age: i % 2 === 0 ? 'elderly' : 'adult',
        fabricIndex: i
      });
      const bx = 18 + i * 2.2;
      const bz = 26.5;
      npc.root.position.set(bx, 0.0, bz);
      npc.root.rotation.y = Math.PI; // Face Buddha statues
      npc.state = 'praying_wai';
      npc.animPhase = i * 0.8;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }

    // 4 Devotees applying gold leaf on Luk Nimit
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      const npc = this.createStylizedCharacter({
        gender: i % 2 === 0 ? 'female' : 'male',
        fabricIndex: i + 2
      });
      npc.root.position.set(26 + Math.cos(angle) * 1.9, 0.0, 31 + Math.sin(angle) * 1.9);
      npc.root.rotation.y = -angle - Math.PI / 2; // Face center Luk Nimit
      npc.state = 'gold_pasting';
      npc.animPhase = i * 1.1;

      this.npcs.push(npc);
      this.scene.add(npc.root);
    }
  }

  attachKrathongInHands(npc) {
    const miniK = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14 * npc.scale, 0.14 * npc.scale, 0.06 * npc.scale, 10),
      this.getMaterial(0x2e7d32, 0.6)
    );
    miniK.add(base);

    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.065 * npc.scale, 8, 8),
      this.getMaterial(0xffb300, 0.4)
    );
    flower.position.y = 0.04 * npc.scale;
    miniK.add(flower);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015 * npc.scale, 0.015 * npc.scale, 0.09 * npc.scale, 6),
      this.getMaterial(0xffeb3b, 0.2)
    );
    candle.position.set(0.02 * npc.scale, 0.08 * npc.scale, 0);
    miniK.add(candle);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 * npc.scale, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff9800 })
    );
    flame.position.set(0.02 * npc.scale, 0.13 * npc.scale, 0);
    miniK.add(flame);

    miniK.position.set(0, -0.15 * npc.scale, 0.32 * npc.scale);
    npc.chestGroup.add(miniK);
  }

  /* -------------------------------------------------------------
     FLUID ANIMATION SEQUENCES (NATURAL BENDING OF JOINTS)
     ------------------------------------------------------------- */
  update(delta, time) {
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      const ph = time * 2.4 + npc.animPhase;

      // 1. KNEELING & FLOATING KRATHONG (Strictly at pier edge, bending knees and spine)
      if (npc.state === 'kneeling_river') {
        npc.pelvis.position.y = 0.46 * npc.scale;
        npc.leftHip.rotation.x = -1.35;
        npc.rightHip.rotation.x = -1.35;
        npc.leftKnee.rotation.x = 2.1;
        npc.rightKnee.rotation.x = 2.1;

        npc.spine.rotation.x = 0.45;
        npc.headGroup.rotation.x = -0.2 + Math.sin(ph * 0.8) * 0.08;

        npc.leftShoulder.rotation.x = -0.7 + Math.sin(ph * 0.8) * 0.1;
        npc.rightShoulder.rotation.x = -0.7 + Math.sin(ph * 0.8) * 0.1;
        npc.leftElbow.rotation.x = -0.3;
        npc.rightElbow.rotation.x = -0.3;
        npc.leftShoulder.rotation.z = 0.25;
        npc.rightShoulder.rotation.z = -0.25;
      }

      // 2. HOLDING KRATHONG REVERENTLY (Standing poised)
      else if (npc.state === 'holding_krathong') {
        npc.pelvis.position.y = (1.02 + Math.sin(ph * 0.8) * 0.015) * npc.scale;
        npc.leftHip.rotation.x = 0;
        npc.rightHip.rotation.x = 0;
        npc.leftKnee.rotation.x = 0;
        npc.rightKnee.rotation.x = 0;

        npc.leftShoulder.rotation.x = -0.75;
        npc.rightShoulder.rotation.x = -0.75;
        npc.leftElbow.rotation.x = -0.9;
        npc.rightElbow.rotation.x = -0.9;
        npc.leftShoulder.rotation.z = 0.32;
        npc.rightShoulder.rotation.z = -0.32;
        npc.headGroup.rotation.y = Math.sin(ph * 0.4) * 0.12;
      }

      // 3. WALKING IN MARKET BOULEVARD (Natural leg swing & arm counter-balance)
      else if (npc.state === 'walking_market') {
        npc.root.position.x += npc.walkDirection * 0.75 * delta;
        if (npc.root.position.x > npc.maxX) {
          npc.walkDirection = -1;
          npc.root.rotation.y = -Math.PI / 2;
        } else if (npc.root.position.x < npc.minX) {
          npc.walkDirection = 1;
          npc.root.rotation.y = Math.PI / 2;
        }

        const walkCycle = time * 4.6 + npc.animPhase;
        npc.leftHip.rotation.x = Math.sin(walkCycle) * 0.55;
        npc.rightHip.rotation.x = -Math.sin(walkCycle) * 0.55;
        npc.leftKnee.rotation.x = Math.max(0, -Math.sin(walkCycle) * 0.6);
        npc.rightKnee.rotation.x = Math.max(0, Math.sin(walkCycle) * 0.6);

        npc.leftShoulder.rotation.x = -Math.sin(walkCycle) * 0.45;
        npc.rightShoulder.rotation.x = Math.sin(walkCycle) * 0.45;
        npc.leftElbow.rotation.x = -0.15;
        npc.rightElbow.rotation.x = -0.15;

        npc.pelvis.position.y = (1.02 + Math.abs(Math.sin(walkCycle)) * 0.04) * npc.scale;
        npc.headGroup.rotation.y = Math.sin(walkCycle * 0.25) * 0.18;
      }

      // 4. SITTING DINING AT BENCHES
      else if (npc.state === 'sitting_eat') {
        npc.pelvis.position.y = 0.58 * npc.scale;
        npc.leftHip.rotation.x = -1.45;
        npc.rightHip.rotation.x = -1.45;
        npc.leftKnee.rotation.x = 1.45;
        npc.rightKnee.rotation.x = 1.45;

        npc.rightShoulder.rotation.x = -0.8 + Math.sin(ph * 1.5) * 0.25;
        npc.rightElbow.rotation.x = -1.2 + Math.sin(ph * 1.5) * 0.25;
        npc.leftShoulder.rotation.x = -0.4;
        npc.headGroup.rotation.y = Math.sin(ph * 0.5) * 0.25;
      }

      // 5. THAI TRADITIONAL DANCERS (RAMWONG / BLESSING DANCE)
      else if (npc.state === 'thai_dance') {
        const danceCycle = time * 1.6 + npc.animPhase;
        npc.leftShoulder.rotation.x = -0.7 + Math.sin(danceCycle) * 0.4;
        npc.rightShoulder.rotation.x = -0.7 - Math.sin(danceCycle) * 0.4;
        npc.leftShoulder.rotation.z = 0.75 + Math.cos(danceCycle) * 0.3;
        npc.rightShoulder.rotation.z = -0.75 - Math.cos(danceCycle) * 0.3;
        npc.leftElbow.rotation.x = -0.6 + Math.sin(danceCycle) * 0.2;
        npc.rightElbow.rotation.x = -0.6 - Math.sin(danceCycle) * 0.2;

        npc.spine.rotation.z = Math.sin(danceCycle) * 0.1;
        npc.pelvis.position.y = (1.02 + Math.sin(danceCycle * 2) * 0.03) * npc.scale;
        npc.headGroup.rotation.z = Math.sin(danceCycle) * 0.12;
      }

      // 6. AUDIENCE CLAPPING AT STAGE
      else if (npc.state === 'watching_clapping') {
        const clap = Math.sin(time * 6.5 + npc.animPhase);
        npc.leftShoulder.rotation.x = -0.75;
        npc.rightShoulder.rotation.x = -0.75;
        npc.leftElbow.rotation.x = -1.1;
        npc.rightElbow.rotation.x = -1.1;
        npc.leftShoulder.rotation.z = 0.28 + clap * 0.15;
        npc.rightShoulder.rotation.z = -0.28 - clap * 0.15;
      }

      // 7. PRAYING / WAI (พนมมือ) AT BIRTHDAY BUDDHAS
      else if (npc.state === 'praying_wai') {
        npc.leftShoulder.rotation.x = -0.85;
        npc.rightShoulder.rotation.x = -0.85;
        npc.leftElbow.rotation.x = -1.35;
        npc.rightElbow.rotation.x = -1.35;
        npc.leftShoulder.rotation.z = 0.45;
        npc.rightShoulder.rotation.z = -0.45;

        npc.spine.rotation.x = 0.22 + Math.sin(ph * 0.6) * 0.08;
        npc.headGroup.rotation.x = 0.28 + Math.sin(ph * 0.6) * 0.08;
      }

      // 8. PASTING GOLD LEAF ON LUK NIMIT
      else if (npc.state === 'gold_pasting') {
        npc.rightShoulder.rotation.x = -1.15 + Math.sin(ph * 2) * 0.18;
        npc.rightElbow.rotation.x = -0.5;
        npc.leftShoulder.rotation.x = -0.3;
        npc.spine.rotation.x = 0.15;
      }

      // 9. CARNIVAL GAMES (Aiming dart / tossing rings)
      else if (npc.state === 'playing_game') {
        if (npc.gameIdx === 0) {
          const throwPh = (time * 1.6 + npc.animPhase) % (Math.PI * 2);
          if (throwPh < 1.0) {
            npc.rightShoulder.rotation.x = -1.5 + throwPh * 0.9;
            npc.rightElbow.rotation.x = -1.3 + throwPh * 1.1;
          } else {
            npc.rightShoulder.rotation.x = -0.6;
            npc.rightElbow.rotation.x = -0.4;
          }
        } else {
          npc.rightShoulder.rotation.x = -1.2 + Math.sin(ph * 1.6) * 0.3;
        }
      }

      // 10. COOKING VENDORS
      else if (npc.state === 'cooking_vendor') {
        npc.rightShoulder.rotation.x = -0.7 + Math.sin(ph * 3.5) * 0.25;
        npc.rightElbow.rotation.x = -0.8;
        npc.spine.rotation.x = 0.15;
      }

      // 11. ADMIRING SKY LANTERNS
      else if (npc.state === 'admiring_sky') {
        npc.headGroup.rotation.x = -0.45 + Math.sin(ph * 0.5) * 0.08;
        npc.spine.rotation.x = -0.08;
      }
    }
  }
}
