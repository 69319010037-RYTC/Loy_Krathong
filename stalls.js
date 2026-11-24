/* ===================================================================
   stalls.js - Vibrant, Colorful Festival Stalls with Rich 3D Props
   Features:
   - Bright striped festival canopies with scalloped awnings & illuminated signs
   - Highly detailed 3D food props, steaming pots, glass jars, plush prizes
   - Clean alignment within the 5 distinct festival plazas
   =================================================================== */

export class FestivalStalls {
  constructor(scene) {
    this.scene = scene;

    this.materials = {
      woodLight: new THREE.MeshLambertMaterial({ color: 0xa1887f, roughness: 0.7 }),
      woodDark: new THREE.MeshLambertMaterial({ color: 0x4e342e, roughness: 0.8 }),
      teakWood: new THREE.MeshLambertMaterial({ color: 0x5d4037, roughness: 0.75 }),
      gold: new THREE.MeshLambertMaterial({ color: 0xffd54f, roughness: 0.35, metalness: 0.7 }),
      brass: new THREE.MeshLambertMaterial({ color: 0xc5a059, roughness: 0.4, metalness: 0.6 }),
      blackIron: new THREE.MeshLambertMaterial({ color: 0x212121, roughness: 0.5, metalness: 0.4 }),
      clothWhite: new THREE.MeshLambertMaterial({ color: 0xffffff, roughness: 0.9 })
    };

    this.initMarketZone();
    this.initCulturalStage();
    this.initGameStalls();
    this.initMeritZone();
  }

  /* -------------------------------------------------------------
     BASE VIBRANT FESTIVAL BOOTH BUILDER
     ------------------------------------------------------------- */
  createVibrantStall(x, z, canopyColorA, canopyColorB, signText) {
    const stall = new THREE.Group();
    stall.castShadow = true;

    // 1. Counter Base (Warm wooden counter)
    const counter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.15, 1.8), this.materials.woodDark);
    counter.position.y = 0.575;
    counter.castShadow = true;
    counter.receiveShadow = true;
    stall.add(counter);

    // Counter Tabletop (Polished light wood)
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 2.0), this.materials.woodLight);
    top.position.y = 1.21;
    top.castShadow = true;
    top.receiveShadow = true;
    stall.add(top);

    // 2. Four Wooden Corner Pillars
    const pilGeo = new THREE.CylinderGeometry(0.065, 0.065, 2.5, 8);
    [[-1.7, -0.8], [1.7, -0.8], [-1.7, 0.8], [1.7, 0.8]].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(pilGeo, this.materials.teakWood);
      pole.position.set(px, 1.4, pz);
      pole.castShadow = true;
      stall.add(pole);
    });

    // 3. Vibrant Striped Canopy Roof (Alternating Carnival Stripes)
    const canopyGroup = new THREE.Group();
    canopyGroup.position.y = 2.8;

    const stripeCount = 8;
    const stripeWidth = 3.8 / stripeCount;
    for (let s = 0; s < stripeCount; s++) {
      const col = s % 2 === 0 ? canopyColorA : canopyColorB;
      const stripeMat = new THREE.MeshLambertMaterial({ color: col, roughness: 0.5 });
      const stripeMesh = new THREE.Mesh(new THREE.BoxGeometry(stripeWidth * 0.98, 0.85, 2.2), stripeMat);
      stripeMesh.position.set(-1.9 + stripeWidth * (s + 0.5), 0, 0);
      stripeMesh.rotation.x = -0.15; // Slanted pitch
      stripeMesh.castShadow = true;
      canopyGroup.add(stripeMesh);
    }

    // Scalloped decorative valance edge
    const valanceMat = new THREE.MeshLambertMaterial({ color: canopyColorA, roughness: 0.4 });
    const valance = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.22, 0.06), valanceMat);
    valance.position.set(0, -0.32, 1.05);
    canopyGroup.add(valance);

    stall.add(canopyGroup);

    // 4. Illuminated Vintage Signboard
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.48, 0.08),
      new THREE.MeshLambertMaterial({ color: 0xffecb3, roughness: 0.6 })
    );
    signBoard.position.set(0, 3.4, 0.6);
    signBoard.castShadow = true;
    stall.add(signBoard);

    // 5. Warm Under-Canopy Lantern Light
    const pLight = new THREE.PointLight(0xffb74d, 1.3, 6.5, 2.0);
    pLight.position.set(0, 2.3, 0);
    pLight.castShadow = true;
    stall.add(pLight);

    stall.position.set(x, 0, z);
    this.scene.add(stall);
    return stall;
  }

  /* ================= ZONE 2: RETRO MARKET STALLS ================= */
  initMarketZone() {
    // Row 1 (z = 7.0, x: -32 to -12)
    this.createKhanomKrokStall(-32, 7.0);
    this.createPakMorStall(-22, 7.0);
    this.createLookChoupStall(-12, 7.0);

    // Row 2 (z = 17.0, x: -32 to -12)
    this.createCottonCandyStall(-32, 17.0);
    this.createHerbalDrinkStall(-22, 17.0);
    this.createBalloonCart(-12, 17.0);

    // Central Dining Seating in market plaza (x = -22, z = 12.0)
    this.createSeatingZone(-22, 0.0, 12.0);
  }

  createKhanomKrokStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0xd32f2f, 0xffffff, "ขนมครกโบราณ"); // Crimson & white
    
    // Cast iron round pan with indentations
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16), this.materials.blackIron);
    pan.position.set(-0.7, 1.32, 0);
    pan.castShadow = true;
    stall.add(pan);

    // Clay stove under pan with warm glowing embers
    const stove = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.35, 12), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
    stove.position.set(-0.7, 1.1, 0);
    stall.add(stove);

    // White coconut pudding cups inside pan
    const cupMat = new THREE.MeshLambertMaterial({ color: 0xffffff, roughness: 0.3 });
    const chiveMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const cornMat = new THREE.MeshLambertMaterial({ color: 0xffeb3b });

    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const r = i === 0 ? 0 : 0.38;
      const cup = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), cupMat);
      cup.scale.set(1, 0.5, 1);
      cup.position.set(-0.7 + Math.cos(a) * r, 1.37, Math.sin(a) * r);
      stall.add(cup);

      // Topping (spring onion or golden sweet corn)
      const topBit = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), i % 2 === 0 ? chiveMat : cornMat);
      topBit.position.set(cup.position.x, 1.42, cup.position.z);
      stall.add(topBit);
    }

    // Banana leaf serving tray on right side
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.7), new THREE.MeshLambertMaterial({ color: 0x388e3c }));
    tray.position.set(0.7, 1.28, 0);
    stall.add(tray);
  }

  createPakMorStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0x00897b, 0xffd54f, "ข้าวเกรียบปากหม้อ"); // Teal & gold
    
    // Brass steamer pot with white cloth dome
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.42, 16), this.materials.brass);
    pot.position.set(-0.6, 1.45, 0);
    pot.castShadow = true;
    stall.add(pot);

    const clothDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      this.materials.clothWhite
    );
    clothDome.position.set(-0.6, 1.66, 0);
    stall.add(clothDome);

    // Serving plate with purple butterfly pea & pandan dumplings
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 0.05, 16), this.materials.clothWhite);
    plate.position.set(0.7, 1.28, 0);
    stall.add(plate);

    const dumpMat1 = new THREE.MeshLambertMaterial({ color: 0xab47bc, roughness: 0.3, transparent: true, opacity: 0.9 });
    const dumpMat2 = new THREE.MeshLambertMaterial({ color: 0x66bb6a, roughness: 0.3, transparent: true, opacity: 0.9 });

    for (let i = 0; i < 6; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), i % 2 === 0 ? dumpMat1 : dumpMat2);
      d.scale.set(1.4, 0.6, 0.85);
      d.position.set(0.55 + (i % 2) * 0.22, 1.34, -0.18 + i * 0.08);
      stall.add(d);
    }
  }

  createLookChoupStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0xf57c00, 0xffeb3b, "ลูกชุบ & ขนมมงคล"); // Amber & yellow
    
    // Golden Tiered Tray (พานทองเหลือง)
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.08, 16), this.materials.gold);
    tray.position.set(-0.6, 1.3, 0);
    tray.castShadow = true;
    stall.add(tray);

    // Colorful glossy fruit miniature sweets (mango, chili, orange)
    const fruitColors = [0xe53935, 0x43a047, 0xfdd835, 0xf4511e, 0x8e24aa];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const cMat = new THREE.MeshLambertMaterial({ color: fruitColors[i % fruitColors.length], roughness: 0.15, metalness: 0.25 });
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), cMat);
      fruit.position.set(-0.6 + Math.cos(a) * 0.34, 1.37, Math.sin(a) * 0.34);
      stall.add(fruit);
    }

    // Golden Bowl of Thong Yip & Thong Yod on right
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.25, 0.25, 16), this.materials.gold);
    bowl.position.set(0.7, 1.35, 0);
    stall.add(bowl);
  }

  createCottonCandyStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0xd81b60, 0x81d4fa, "สายไหมย้อนยุค"); // Pink & baby blue
    
    // Fluffy Pastel Cotton Candy Clouds on sticks
    const pinkCloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 14),
      new THREE.MeshLambertMaterial({ color: 0xf48fb1, roughness: 0.9 })
    );
    pinkCloud.scale.set(1.0, 1.6, 1.0);
    pinkCloud.position.set(-0.5, 1.8, 0.1);
    stall.add(pinkCloud);

    const blueCloud = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 14),
      new THREE.MeshLambertMaterial({ color: 0x80d8ff, roughness: 0.9 })
    );
    blueCloud.scale.set(1.0, 1.6, 1.0);
    blueCloud.position.set(0.5, 1.8, 0.1);
    stall.add(blueCloud);
  }

  createHerbalDrinkStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0x283593, 0xffea00, "น้ำสมุนไพรไทย"); // Indigo & yellow
    
    // 3 Large Glass Jars with internal light
    const glassMat = new THREE.MeshLambertMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.45 });
    const juices = [
      { col: 0xc62828, x: -0.85, name: "กระเจี๊ยบ" },
      { col: 0xffd600, x: 0.0,   name: "เก๊กฮวย" },
      { col: 0x4a148c, x: 0.85,  name: "อัญชันมะนาว" }
    ];

    juices.forEach(({ col, x }) => {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.65, 14), glassMat);
      jar.position.set(x, 1.58, 0);
      stall.add(jar);

      const juice = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.55, 14),
        new THREE.MeshLambertMaterial({ color: col, roughness: 0.2 })
      );
      juice.position.set(x, 1.53, 0);
      stall.add(juice);

      // Glowing liquid light
      const jLight = new THREE.PointLight(col, 0.6, 2.5);
      jLight.position.set(x, 1.6, 0);
      stall.add(jLight);
    });
  }

  createBalloonCart(x, z) {
    const cart = new THREE.Group();
    // Wooden push cart
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.2), this.materials.woodLight);
    body.position.y = 0.75;
    body.castShadow = true;
    cart.add(body);

    // Wheels
    [-0.7, 0.7].forEach(wx => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 14), this.materials.woodDark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.38, -0.65);
      cart.add(wheel);
      const wheel2 = wheel.clone();
      wheel2.position.z = 0.65;
      cart.add(wheel2);
    });

    // Tall rod holding bunch of balloons
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2, 8), this.materials.teakWood);
    pole.position.set(0, 2.2, 0);
    cart.add(pole);

    // 16 Colorful glowing balloons
    const bColors = [0xff1744, 0xffea00, 0x00e676, 0x2979ff, 0xd500f9, 0xff9100];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const bMat = new THREE.MeshLambertMaterial({
        color: bColors[i % bColors.length],
        roughness: 0.25,
        metalness: 0.2
      });
      const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), bMat);
      balloon.scale.set(1.0, 1.28, 1.0);
      balloon.position.set(
        Math.cos(a) * (0.42 + (i % 3) * 0.18),
        3.4 + Math.sin(i) * 0.4,
        Math.sin(a) * (0.42 + (i % 3) * 0.18)
      );
      balloon.castShadow = true;
      cart.add(balloon);
    }

    cart.position.set(x, 0, z);
    this.scene.add(cart);
  }

  createSeatingZone(x, y, z) {
    const zone = new THREE.Group();
    // 2 Bamboo tables with benches
    [-4.5, 4.5].forEach(tx => {
      const table = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.65, 14), this.materials.woodLight);
      table.position.set(tx, 0.325, 0);
      table.castShadow = true;
      zone.add(table);

      // 4 Stools around table
      [[-1.3, 0], [1.3, 0], [0, -1.3], [0, 1.3]].forEach(([sx, sz]) => {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 8), this.materials.woodDark);
        stool.position.set(tx + sx, 0.2, sz);
        stool.castShadow = true;
        zone.add(stool);
      });
    });

    zone.position.set(x, y, z);
    this.scene.add(zone);
  }

  /* ================= ZONE 3: CULTURAL ARTS STAGE ================= */
  initCulturalStage() {
    const stage = new THREE.Group();
    // Grand Elevated Wooden Stage (x = 28.0, z = 9.0)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 9), this.materials.teakWood);
    deck.position.y = 0.45;
    deck.castShadow = true;
    deck.receiveShadow = true;
    stage.add(deck);

    // Luxurious Red Carpet Floor
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.05, 8.2), new THREE.MeshLambertMaterial({ color: 0x990000, roughness: 0.8 }));
    carpet.position.y = 0.93;
    stage.add(carpet);

    // Tiered Golden Thai Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3.4, 4), new THREE.MeshLambertMaterial({ color: 0xb73225, roughness: 0.5 }));
    roof.position.set(0, 5.6, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    stage.add(roof);

    // 4 Corner Pillars
    const pilGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.4, 8);
    [[-5.2, -3.8], [5.2, -3.8], [-5.2, 3.8], [5.2, 3.8]].forEach(([px, pz]) => {
      const pil = new THREE.Mesh(pilGeo, this.materials.woodLight);
      pil.position.set(px, 3.0, pz);
      pil.castShadow = true;
      stage.add(pil);
    });

    // Instruments: Ranat Ek (ระนาดเอก)
    const ranat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 2.4, 8), this.materials.woodDark);
    ranat.rotation.z = Math.PI / 2;
    ranat.scale.set(0.6, 1.0, 1.0);
    ranat.position.set(-3.8, 1.25, -2.0);
    ranat.castShadow = true;
    stage.add(ranat);

    // Taphon Drum (ตะโพน)
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.95, 12), this.materials.woodLight);
    drum.rotation.z = Math.PI / 2;
    drum.position.set(-3.8, 1.25, 1.4);
    drum.castShadow = true;
    stage.add(drum);

    // Stage Spotlights
    const spot = new THREE.SpotLight(0xffea9f, 2.8, 18, Math.PI / 4, 0.35);
    spot.position.set(0, 9, 5);
    spot.target.position.set(0, 1, 0);
    spot.castShadow = true;
    stage.add(spot);
    stage.add(spot.target);

    stage.position.set(28, 0, 9);
    this.scene.add(stage);
  }

  /* ================= ZONE 4: TEMPLE FAIR CARNIVAL GAMES ================= */
  initGameStalls() {
    // 4 Carnival Game Booths aligned along z = 30.0, x: -32 to -2
    this.createBalloonDartStall(-32, 30.0);
    this.createRingTossStall(-22, 30.0);
    this.createLuckyEggStall(-12, 30.0);
    this.createStarPluckingStall(-2, 30.0);
  }

  createBalloonDartStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0x7b1fa2, 0xffea00, "ซุ้มปาโป่งมหาสนุก"); // Purple & yellow
    
    // Balloon dart backboard
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.7, 0.1), this.materials.woodDark);
    board.position.set(0, 2.1, -0.65);
    board.castShadow = true;
    stall.add(board);

    // Rows of colorful inflated balloons
    const bColors = [0xe91e63, 0x00e676, 0xffeb3b, 0x29b6f6, 0xff5722];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        const balloon = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 8, 8),
          new THREE.MeshLambertMaterial({ color: bColors[(r + c) % bColors.length] })
        );
        balloon.position.set(-1.15 + c * 0.46, 1.5 + r * 0.5, -0.55);
        stall.add(balloon);
      }
    }
  }

  createRingTossStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0x0097a7, 0xff5722, "ซุ้มโยนห่วงพาโชค"); // Cyan & orange
    
    // Grid of glass bottles on counter
    const bottleMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, roughness: 0.15, metalness: 0.2 });
    for (let bx = -1.2; bx <= 1.2; bx += 0.6) {
      for (let bz = -0.5; bz <= 0.5; bz += 0.5) {
        const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.36, 8), bottleMat);
        bottle.position.set(bx, 1.45, bz);
        stall.add(bottle);
      }
    }
  }

  createLuckyEggStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0xf57c00, 0x00e676, "ซุ้มตักไข่พาโชค"); // Orange & green
    
    // Large round blue water basin
    const tub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.65, 0.38, 16),
      new THREE.MeshLambertMaterial({ color: 0x1976d2, roughness: 0.3 })
    );
    tub.position.set(0, 1.42, 0);
    tub.castShadow = true;
    stall.add(tub);

    // Floating colorful eggs in water
    const eggColors = [0xff1744, 0xffeb3b, 0x00e676, 0xd500f9];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const egg = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshLambertMaterial({ color: eggColors[i % eggColors.length] })
      );
      egg.position.set(Math.cos(a) * 0.44, 1.58, Math.sin(a) * 0.44);
      stall.add(egg);
    }
  }

  createStarPluckingStall(x, z) {
    const stall = this.createVibrantStall(x, z, 0xc2185b, 0x00bcd4, "ซุ้มสอยดาวนำโชค"); // Magenta & cyan
    
    // Bamboo trellis frame hanging origami stars
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.4), this.materials.woodLight);
    frame.position.set(0, 2.4, 0);
    stall.add(frame);

    const starMat = new THREE.MeshLambertMaterial({ color: 0xffd54f, emissive: 0xff9800, emissiveIntensity: 0.4 });
    for (let i = 0; i < 18; i++) {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), starMat);
      star.position.set(-1.1 + (i % 6) * 0.44, 2.1 - Math.floor(i / 6) * 0.28, -0.45 + (i % 3) * 0.4);
      stall.add(star);
    }
  }

  /* ================= ZONE 5: SACRED TEMPLE MERIT COURTYARD ================= */
  initMeritZone() {
    const merit = new THREE.Group();

    // 1. Grand Temple Shrine Pavilion (x = 25.0, z = 28.0)
    const base = new THREE.Mesh(new THREE.BoxGeometry(16, 0.7, 11), this.materials.woodDark);
    base.position.y = 0.35;
    merit.add(base);

    // Tiered Golden Thai Temple Roof with Gilded Ridge and Chofa Spire
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(9.8, 3.2, 4), new THREE.MeshLambertMaterial({ color: 0xb71c1c }));
    roof1.position.set(0, 5.2, 0);
    roof1.rotation.y = Math.PI / 4;
    merit.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(6.5, 2.4, 4), new THREE.MeshLambertMaterial({ color: 0xb71c1c }));
    roof2.position.set(0, 6.8, 0);
    roof2.rotation.y = Math.PI / 4;
    merit.add(roof2);

    // Gilded Spire Top
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 8), new THREE.MeshPhongMaterial({ color: 0xffd54f, specular: 0xffecb3, shininess: 60 }));
    spire.position.y = 8.5;
    merit.add(spire);

    // 6 Gilded Temple Pillars
    const pilGeo = new THREE.CylinderGeometry(0.2, 0.22, 4.4, 8);
    const pilMat = new THREE.MeshPhongMaterial({ color: 0xffd54f, specular: 0xffecb3, shininess: 40 });
    [[-6.5, -4.2], [0, -4.2], [6.5, -4.2], [-6.5, 4.2], [0, 4.2], [6.5, 4.2]].forEach(([px, pz]) => {
      const pil = new THREE.Mesh(pilGeo, pilMat);
      pil.position.set(px, 2.8, pz);
      merit.add(pil);
    });

    // 2. 8 Birthday Buddhas in brass postures with alms donation bowls
    for (let i = 0; i < 8; i++) {
      const bx = -5.6 + i * 1.6;

      // Tiered Altar Pedestal
      const ped = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.9), this.materials.woodLight);
      ped.position.set(bx, 0.95, -2.2);
      merit.add(ped);

      // Golden Buddha Statue representation
      const bStatue = new THREE.Group();
      // Lotus throne base
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.16, 12), new THREE.MeshPhongMaterial({ color: 0xffd54f, specular: 0xffecb3, shininess: 50 }));
      lotusBase.position.y = 0.08;
      bStatue.add(lotusBase);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.62, 8), this.materials.gold);
      torso.position.y = 0.48;
      bStatue.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), this.materials.gold);
      head.position.y = 0.88;
      bStatue.add(head);

      const bSpire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), this.materials.gold);
      bSpire.position.y = 1.08;
      bStatue.add(bSpire);

      bStatue.position.set(bx, 0.95, -2.2);
      merit.add(bStatue);

      // Brass Alms Bowl in front for coins (บาตรพระหยอดเหรียญ)
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.materials.brass);
      bowl.rotation.x = Math.PI;
      bowl.position.set(bx, 0.75, -1.2);
      merit.add(bowl);
    }

    // 3. Central Sacred Golden Luk Nimit on sculpted Lotus Pedestal
    const nimitPed = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.85, 16), this.materials.woodLight);
    nimitPed.position.set(0, 0.75, 2.0);
    merit.add(nimitPed);

    // Gilded Lotus Petal Collar around Luk Nimit base
    const petalRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.18, 8, 16),
      new THREE.MeshPhongMaterial({ color: 0xffd54f, specular: 0xffecb3, shininess: 60 })
    );
    petalRing.rotation.x = Math.PI / 2;
    petalRing.position.set(0, 1.15, 2.0);
    merit.add(petalRing);

    // Sacred Black Stone Sphere
    const nimit = new THREE.Mesh(new THREE.SphereGeometry(0.92, 20, 20), this.materials.blackIron);
    nimit.position.set(0, 2.0, 2.0);
    merit.add(nimit);

    // Golden leaf flakes pasted on Luk Nimit
    for (let g = 0; g < 24; g++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 0.93;
      const goldFlake = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), this.materials.gold);
      goldFlake.position.set(
        Math.sin(phi) * Math.cos(theta) * r,
        2.0 + Math.cos(phi) * r,
        2.0 + Math.sin(phi) * Math.sin(theta) * r
      );
      goldFlake.lookAt(goldFlake.position.x * 2, (goldFlake.position.y - 2.0) * 2 + 2.0, (goldFlake.position.z - 2.0) * 2 + 2.0);
      merit.add(goldFlake);
    }

    // Incense Urn & Candle Stand (กระถางธูปเชิงเทียน) in front of Luk Nimit
    const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.3, 10), this.materials.brass);
    urn.position.set(0, 1.25, 3.2);
    merit.add(urn);

    // Glowing Incense sticks
    for (let s = -1; s <= 1; s++) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), new THREE.MeshBasicMaterial({ color: 0xff5722 }));
      stick.position.set(s * 0.08, 1.5, 3.2);
      merit.add(stick);
    }

    // Sacred Warm Interior Lights
    const mLight = new THREE.PointLight(0xffca28, 1.8, 11);
    mLight.position.set(0, 3.6, 0);
    merit.add(mLight);

    merit.position.set(25, 0, 28);
    this.scene.add(merit);
  }
}
