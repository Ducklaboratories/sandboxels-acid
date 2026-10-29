// realistic_acids_v10.js - Sandboxels mod: LOTS of acids, real and fake (the game only has one)
//
// New category: "acids". The game's own "Acid" (hydrochloric) is left exactly as it is.
// Everything here was tested against the game's real engine.
//
// ============================ REAL-LIFE ACIDS ============================
//  Sulfuric ........ metals, rock; chars sugar/wood/paper/cloth to charcoal. Lead, gold, glass, plastic are safe.
//  Nitric .......... copper, silver, zinc, tin, lead... (brown gas). Gold, iron, steel, aluminum resist it.
//  Hydrofluoric .... the GLASS EATER: glass, sand, rock, brick, ceramics, concrete, bone, flesh. Not metals.
//  Aqua Regia ...... dissolves gold and almost everything. (Nitric + Acid make it.)
//  Hydrobromic / Hydroiodic .... strong halide acids, like hydrochloric but harder.
//  Chromic Acid .... strong oxidizer, eats metals; alcohol, oil and wood can catch FIRE.
//  Red Fuming Nitric .... rocket oxidizer. Fuels and organics EXPLODE on contact.
//  Triflic Acid .... a superacid that does NOT eat glass. Metals, rock, organics dissolve.
//  Sulfamic Acid ... descaler: limestone, calcium, concrete; rust turns back into iron.
//  Citric, Phosphoric, Glacial Acetic, Carbonic, Formic, Stomach, Battery, Boric (bug killer), Piranha,
//  Perchloric (explosive with organics), Magic Acid (melts plastic and wax).
//  Mixed Acid ..... nitric + sulfuric (mix them!). Turns cloth, paper, wood and sugar into GUNPOWDER (like guncotton).
//  Peracetic Acid . disinfectant. Kills cells, yeast and bugs.   Oleum ... fuming sulfuric, violent with water.
//  Fuming Hydrochloric (smoking, stronger than Acid), Lactic, Oxalic, Carbolic, Prussic (poison: kills bugs, cells, plants).
//  Chlorosulfonic (VIOLENT with water), Ferric Chloride (metal etchant: eats ONLY metals), Drain Cleaner (eats ONLY organic things),
//  Malic, Tartaric (copper cleaner), Ascorbic (rust remover), Salicylic.
//  Superacid ....... melts EVERYTHING except plastic, pipes and walls.
//  Superacid (Concrete Safe) ... same but concrete is immune.   Concrete Dissolver ... ONLY concrete.
//
// ============================ FAKE / FANTASY ACIDS ============================
//  Alien Acid ...... eats through absolutely everything, even plastic and pipes. Very fast.
//  Midas Acid ...... turns metals into GOLD.            Rust Acid ...... turns metals into RUST.
//  Petrify Acid .... turns living and organic things into ROCK.   Ash Acid ...... turns organics into ASH.
//  Melting Acid .... heats whatever it touches by hundreds of degrees until it melts.
//  Cryo Acid ....... freezes whatever it touches (water turns to ice).
//  Chaos Acid ...... turns solids into random other materials.
//  Virus Acid ...... turns what it touches INTO MORE VIRUS ACID. It spreads! Be careful.
//  Growth Acid ..... dirt and mud turn to grass.   Magma Acid .... solids turn to MAGMA.   Glass Acid ... sand and rock turn to GLASS.
//  Slime Acid ...... solids turn to slime.   Blast Acid ..... things EXPLODE.   Hellfire Acid .. things burst into FIRE.
//  Clone Acid ...... duplicates whatever it touches.   Repair Acid ... rubble becomes concrete, rust becomes iron, ash becomes wood.
//  Diamond Acid .... charcoal becomes DIAMOND.
//  CONVERTER ACIDS (touch something and it becomes something else):
//     Timber -> wood   Foam -> foam   Salt -> salt   Sweet -> sugar   Dirt -> dirt   Sand (erosion) -> rock/brick/glass/concrete become SAND
//     Vapor -> smoke/steam   Shock -> electric sparks off metal   Oil -> oil   Aqua -> water   Steel -> steel   Plastic -> plastic   Brick -> brick
//  Virus Acid (liquid) and Virus Goo (sticky, climbs walls): both turn what they touch into more of themselves, fast.
//  PURPOSE ACIDS: Weed Killer (kills plants), Fire Retardant (puts out fire), Deicer (melts ice and snow),
//     Dye acids in red, blue, green, black and white (paint whatever they touch), Fume Acid (turns solids into explosive gas).
//  The game's own Acid and Vinegar now live in the Acids tab too.
//  ACID FIGHTS: stronger acids EAT weaker acids on contact (top: Alien, Superacid, Triflic, Magic; then Aqua Regia, RFNA, Oleum...; then the game's Acid,
//  Sulfuric, Nitric...; then most others; weakest are the mild and food acids). Equal acids destroy each other. The top acids kill the viruses, and the
//  viruses infect EVERY acid. Acid Neutralizer kills every acid. The game's own Acid is part of the fights and cannot eat acid-proof concrete.
//  IN-GAME GUIDE: pick "Acid Guide" in the Acids tab (or type acidGuide() in the console) for what every acid does, how to make the mixed ones,
//  and a "I want to..." finder (dissolve only metals, remove rust, put out fire, paint, make explosives...).
//  Acid Neutralizer  a base that turns any acid into water. Use it to put out the fires.
//
// Every acid is now about twice as fast as before. Console:  acidPower(2) = twice as fast AGAIN, acidPower(0.5) = half, acidPower(1) = normal.
// Acids are used up as they dissolve things. Bases (baking soda, lye, ammonia, lime) neutralize them.
// Load the solid concrete mod BEFORE this one if you want Concrete Dissolver to leave rebar behind.

(function () {
  // ---------------- lists of element names (names that don't exist are simply never matched) ----------------
  const GLASSY   = ["glass", "glass_shard", "rad_glass", "rad_shard", "stained_glass"];
  const PLASTICS = ["plastic", "molten_plastic", "bead", "polymer_concrete", "reinforced_polymer_concrete", "polymer_mix",
                    "sulfur_concrete", "reinforced_sulfur_concrete", "sulfur_mix"];
  const WATERS   = ["water", "salt_water", "sugar_water", "dirty_water", "pool_water"];
  const MISC     = ["fire", "smoke", "steam", "bubble", "hydrogen", "chlorine", "carbon_dioxide", "nitrogen_dioxide",
                    "earthquake", "tornado", "tsunami", "liquid_light", "sensor", "lye", "foam", "pop", "explosion"];
  const HOLDERS  = ["pipe", "pipe_wall", "wall", "rock_wall", "gate", "filter"];
  const NOBLE    = ["gold", "gold_coin", "rose_gold", "purple_gold", "blue_gold", "electrum", "diamond"];
  const CERAMICS = ["porcelain", "porcelain_shard", "baked_clay"];
  const CONCRETE = ["concrete", "reinforced_concrete", "concrete_rubble", "cement"].concat(
    Object.keys(elements).filter(n => /concrete|cement|_mix$/.test(n) && !/polymer|sulfur/.test(n) &&
      ["concrete", "reinforced_concrete", "concrete_rubble", "cement", "concrete_guide", "concrete_dissolver", "superacid_concrete_safe"].indexOf(n) === -1));
  const METALS   = ["iron", "steel", "copper", "aluminum", "lead", "tin", "zinc", "silver", "nickel", "brass", "bronze", "magnesium"];
  const ORGANICS = ["wood", "paper", "cloth", "sugar", "plant", "dead_plant", "tree_branch", "grass", "meat", "cooked_meat",
                    "head", "body", "bone", "bone_marrow", "oil", "wax", "glue", "dough", "cheese", "egg", "cell", "cancer",
                    "yeast", "fiber", "sawdust", "candy", "charcoal"];
  const FUELS    = ["oil", "wax", "gasoline", "diesel", "kerosene", "alcohol", "ethanol", "propane", "methane", "glue", "rubber"];
  const REAL_ACIDS = ["sulfuric_acid", "nitric_acid", "hydrofluoric_acid", "aqua_regia", "superacid", "superacid_concrete_safe",
    "concrete_dissolver", "citric_acid", "phosphoric_acid", "glacial_acetic_acid", "carbonic_acid", "formic_acid", "perchloric_acid",
    "piranha_solution", "magic_acid", "stomach_acid", "battery_acid", "boric_acid", "hydrobromic_acid", "hydroiodic_acid", "chromic_acid",
    "red_fuming_nitric_acid", "triflic_acid", "sulfamic_acid", "mixed_acid", "peracetic_acid", "oleum",
    "fuming_hydrochloric_acid", "lactic_acid", "oxalic_acid", "prussic_acid", "carbolic_acid",
    "chlorosulfonic_acid", "ferric_chloride", "drain_cleaner", "malic_acid", "tartaric_acid", "ascorbic_acid", "salicylic_acid",
    "selenic_acid", "hypochlorous_acid", "sulfurous_acid", "gallic_acid", "tannic_acid"];
  const FAKE_ACIDS = ["alien_acid", "midas_acid", "rust_acid", "petrify_acid", "ash_acid", "melting_acid", "cryo_acid", "chaos_acid",
    "virus_acid", "acid_neutralizer", "growth_acid", "magma_acid", "glass_acid", "slime_acid", "blast_acid", "hellfire_acid",
    "clone_acid", "repair_acid", "diamond_acid", "virus_goo", "timber_acid", "foam_acid", "salt_acid", "sweet_acid", "dirt_acid", "sand_acid",
    "vapor_acid", "shock_acid", "oil_acid", "aqua_acid", "steel_acid", "plastic_acid", "brick_acid",
    "weed_killer", "fire_retardant", "deicer", "dye_red", "dye_blue", "dye_green", "dye_black", "dye_white", "fume_acid",
    "silver_acid", "copper_acid", "mud_acid", "snow_acid", "shatter_acid"];
  const ACID_NAMES = ["acid", "neutral_acid", "acid_gas", "acid_cloud"].concat(REAL_ACIDS, FAKE_ACIDS);
  const BASES = { // things that neutralize an acid (same idea as the game's own acid)
    baking_soda: { elem1: "salt_water", elem2: ["carbon_dioxide", "foam"] },
    lye:         { elem1: "salt_water", elem2: null },
    ammonia:     { elem1: "neutral_acid", elem2: null },
    quicklime:   { elem1: "neutral_acid", elem2: null },
    slaked_lime: { elem1: "neutral_acid", elem2: null },
    borax:       { elem1: "neutral_acid", elem2: null },
  };

  function uniq(a) { return a.filter((v, i) => a.indexOf(v) === i); }
  function exists(n) { return !!elements[n]; }
  function safeProduct(p) {                      // keep only products that really exist
    if (p === undefined) return undefined;       // undefined = leave that pixel as it is
    const ok = x => x === null || exists(x) || ACID_NAMES.indexOf(x) !== -1;   // our acids may be defined further down
    if (Array.isArray(p)) { const k = p.filter(ok); return k.length ? k : null; }
    return ok(p) ? p : null;
  }
  function reaction(elem1, elem2, chance, extra) {
    const r = {};
    if (elem1 !== undefined) r.elem1 = safeProduct(elem1);     // undefined = leave that pixel as it is
    if (elem2 !== undefined) r.elem2 = safeProduct(elem2);
    if (chance !== undefined) r.chance = chance;
    return Object.assign(r, extra || {});
  }
  function basesFor(reactions) { for (const b in BASES) reactions[b] = reaction(BASES[b].elem1, BASES[b].elem2); }

  const isSolid = e => !e.state || e.state === "solid";   // (the game fills in 'solid' later for most materials)
  // every ordinary material in the game that an acid could touch (built when the mod loads)
  function ordinary(filter) {
    return Object.keys(elements).filter(n => {
      const e = elements[n];
      if (!e || e.tool || e.category === "special" || e.category === "tools" || e.hidden) return false;
      if (ACID_NAMES.indexOf(n) !== -1 || HOLDERS.indexOf(n) !== -1 || MISC.indexOf(n) !== -1) return false;
      return filter(e, n);
    });
  }

  // ---------------- strength dial ----------------
  const SPEEDUP = 2;         // every acid is this much faster than before
  let POWER = 1;            // your own dial: acidPower(n)
  const dbAcids = {};        // name -> { arg, power }
  const reactAcids = {};     // name -> { reactions, base: { target: chance } }

  function fmt(x) { return Number(Math.min(100, x).toFixed(3)); }
  function rows(arg, p) {
    const a = arg ? ":" + arg : "", d = pp => "DB" + a + "%" + fmt(pp);
    return [["XX", d(p), "XX"],
            [d(p) + " AND M2", "XX", d(p) + " AND M2"],
            [d(p) + " AND M2", d(p * 2) + " AND M1", d(p) + " AND M2"]];
  }
  function rememberChances(name, reactions) {
    const base = {};
    for (const k in reactions) base[k] = reactions[k].chance === undefined ? 1 : reactions[k].chance;
    reactAcids[name] = { reactions: reactions, base: base };
    applyChances(name);
  }
  function applyChances(name) {
    const ra = reactAcids[name]; if (!ra) return;
    for (const k in ra.reactions) ra.reactions[k].chance = Math.min(1, ra.base[k] * SPEEDUP * POWER);
  }
  window.acidPower = function (m) {
    if (typeof m !== "number" || !(m > 0)) return "acid strength x" + POWER;
    POWER = m;
    for (const n in dbAcids) if (elements[n]) elements[n].behavior = rows(dbAcids[n].arg, dbAcids[n].power * SPEEDUP * POWER);
    for (const n in reactAcids) applyChances(n);
    return "acid strength x" + POWER;
  };

  // ---------------- acid factories ----------------
  // DB acid: dissolves a neighbour with a % chance each tick, and is used up doing it.
  //   opts.except = things it will NOT dissolve (everything else dissolves) | opts.only = the ONLY things it dissolves
  function makeAcid(name, opts) {
    const arg = opts.only ? uniq(opts.only).join(",") : "";
    dbAcids[name] = { arg: arg, power: opts.power };
    const el = {
      color: opts.color, category: "acids", state: "liquid", density: opts.density,
      behavior: rows(arg, opts.power * SPEEDUP * POWER),
      reactions: opts.reactions || {},
      tempHigh: opts.boil,
      stateHigh: exists(opts.gas || "smoke") ? (opts.gas || "smoke") : "smoke",
      stain: -0.1, alias: opts.alias, desc: opts.desc,
    };
    if (opts.except) el.ignore = uniq(opts.except);
    elements[name] = el;
    rememberChances(name, el.reactions);
  }
  // Reaction acid: a plain liquid whose reactions do all the work.
  function makeReactAcid(name, opts) {
    elements[name] = {
      color: opts.color, behavior: behaviors.LIQUID, category: "acids", state: "liquid", density: opts.density || 1100,
      reactions: opts.reactions, tempHigh: opts.boil || 200, stateHigh: exists(opts.gas || "smoke") ? (opts.gas || "smoke") : "smoke",
      stain: opts.stain === undefined ? -0.1 : opts.stain, alias: opts.alias, desc: opts.desc,
    };
    if (opts.viscosity) elements[name].viscosity = opts.viscosity;
    rememberChances(name, opts.reactions);
  }

  // ---------------- brown gas ----------------
  elements.nitrogen_dioxide = {
    color: ["#b0702c", "#a0622a", "#c07c34"], behavior: behaviors.GAS, category: "gases", state: "gas", density: 1.9,
    desc: "Brown, sharp-smelling gas given off by nitric acid.",
  };

  const COMMON_SAFE = uniq([].concat(ACID_NAMES, GLASSY, PLASTICS, WATERS, MISC, HOLDERS));
  const rustToIron = () => reaction(null, "iron", 0.3);          // derusting leaves clean metal
  function withWater(r, chance) { r.water = reaction(null, "dirty_water", chance === undefined ? 0.2 : chance); return r; }
  function std(chance) { const r = {}; basesFor(r); return withWater(r, chance); }

  // =========================== REAL-LIFE ACIDS ===========================
  // ---- Sulfuric ----
  const sulfReact = std();
  sulfReact.nitric_acid = reaction("mixed_acid", "mixed_acid");   // sulfuric + nitric = mixed acid
  ["sugar", "wood", "paper", "cloth", "plant", "dead_plant", "tree_branch", "grass"].forEach(n => { sulfReact[n] = reaction(null, "charcoal", 0.25); });
  makeAcid("sulfuric_acid", {
    color: ["#ebe3a0", "#e6dc92", "#f0ebb0"], density: 1830, power: 5, boil: 337, alias: "oil of vitriol",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["lead", "sugar", "wood", "paper", "cloth", "plant", "dead_plant", "tree_branch", "grass"]),
    reactions: sulfReact,
    desc: "Eats metals and rock. Chars sugar, wood, paper and cloth to charcoal. Lead, gold, glass and plastic are safe.",
  });

  // ---- Nitric ----
  const nitMetals = ["copper", "silver", "zinc", "brass", "bronze", "nickel", "tin", "lead", "magnesium"];
  const nitReact = std();
  nitMetals.forEach(n => { nitReact[n] = reaction(null, "nitrogen_dioxide", 0.2); });
  nitReact.acid = reaction("aqua_regia", "aqua_regia");
  nitReact.sulfuric_acid = reaction("mixed_acid", "mixed_acid");
  makeAcid("nitric_acid", {
    color: ["#f2cf5a", "#ecc44c", "#f7d96a"], density: 1510, power: 6, boil: 83, gas: "nitrogen_dioxide", alias: "aqua fortis",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["iron", "steel", "aluminum", "tungsten"], nitMetals),
    reactions: nitReact,
    desc: "Eats copper, silver, zinc and more, with brown gas. Gold, iron, steel and aluminum resist it. Mix with Acid to make Aqua Regia.",
  });

  // ---- Hydrofluoric ----
  makeAcid("hydrofluoric_acid", {
    color: ["#b4e0ee", "#a6d8e8", "#c0e8f4"], density: 1150, power: 6, boil: 105,
    only: [].concat(GLASSY, CERAMICS, CONCRETE, ["sand", "rock", "gravel", "mudstone", "sandstone", "brick", "brick_rubble", "clay",
                    "clay_shard", "limestone", "bone", "bone_marrow", "head", "body", "meat"]),
    reactions: std(),
    desc: "The glass eater. Dissolves glass, sand, rock, brick, ceramics, concrete, bone and flesh. Metals and plastic are safe.",
  });

  // ---- Aqua regia ----
  makeAcid("aqua_regia", {
    color: ["#ee9a2a", "#e48c22", "#f4a63a"], density: 1200, power: 8, boil: 100, alias: "royal water",
    except: COMMON_SAFE.concat(["diamond"], CERAMICS), reactions: std(),
    desc: "Nitric + hydrochloric acid. Dissolves gold and nearly everything else. Glass, plastic, diamond and ceramics resist it.",
  });

  // ---- Superacids ----
  makeAcid("superacid", {
    color: ["#c9a0ff", "#bb8cff", "#d8b4ff"], density: 2880, power: 20, boil: 150, alias: "fluoroantimonic acid",
    except: [].concat(ACID_NAMES, PLASTICS, MISC, HOLDERS),
    desc: "Melts EVERYTHING except plastic, pipes and walls. Very fast.",
  });
  makeAcid("superacid_concrete_safe", {
    color: ["#9effd4", "#8cf5c6", "#b0ffe0"], density: 2880, power: 20, boil: 150,
    except: [].concat(ACID_NAMES, PLASTICS, MISC, HOLDERS, CONCRETE),
    desc: "Melts everything EXCEPT concrete, reinforced concrete, rubble, cement, plastic, pipes and walls.",
  });

  // ---- Concrete dissolver (reactions only) ----
  const cdReact = {}; basesFor(cdReact);
  const rebarOrGravel = exists("rebar") ? "rebar" : "gravel";
  // Dissolved concrete mostly VANISHES (cement paste washes away) and only some stones are left, so loose gravel
  // can't seal the surface and the acid keeps going down. Only about 1 in 3 reactions uses the acid up.
  // It is heavier than gravel and sand, so it sinks DOWN THROUGH the loose stones it leaves behind.
  const keepAcid = ["concrete_dissolver", "concrete_dissolver", null];
  cdReact.concrete            = reaction(keepAcid, [null, null, null, "gravel", "sand"], 0.3);
  cdReact.reinforced_concrete = reaction(keepAcid, [null, null, rebarOrGravel, "gravel"], 0.3);
  cdReact.concrete_rubble     = reaction(keepAcid, [null, null, "sand"], 0.4);
  cdReact.cement              = reaction(keepAcid, null, 0.4);
  cdReact.limestone           = reaction(keepAcid, [null, "carbon_dioxide", "gravel"], 0.3);
  CONCRETE.forEach(n => {                       // every other kind of concrete the concrete mod added
    if (cdReact[n]) return;
    const wet = /_mix$|_cement$|^liquid_concrete$/.test(n);
    cdReact[n] = reaction(keepAcid, wet ? null : [null, null, "gravel", "sand"], wet ? 0.4 : 0.3);
  });
  makeReactAcid("concrete_dissolver", {
    color: ["#f4a0b4", "#ee94a8", "#f8b0c0"], density: 1900, boil: 105, alias: "concrete remover", reactions: cdReact, viscosity: 6000,   // a thick gel: stays on the concrete instead of running off
   
    desc: "Only dissolves concrete, cement and limestone. A thick gel that stays put and eats down through thick slabs. Leaves some stones and steel bars behind.",
  });

  // ---- Citric ----
  const citReact = std(0.1); citReact.rust = rustToIron();
  makeAcid("citric_acid", {
    color: ["#f2ee9c", "#ece890", "#f6f2a8"], density: 1100, power: 2.5, boil: 100,
    only: ["limestone", "calcium", "bone", "bone_marrow", "mudstone", "slaked_lime", "quicklime", "zinc", "magnesium", "aluminum", "tin", "iron", "copper"],
    reactions: citReact,
    desc: "Weak but real. Strips rust back to clean iron, dissolves limestone, calcium and bone, and slowly eats zinc, tin, aluminum, iron and copper.",
  });

  // ---- Phosphoric ----
  const phosReact = std(0.1); phosReact.rust = rustToIron();
  makeAcid("phosphoric_acid", {
    color: ["#d6e4ea", "#cddde4", "#dfecf0"], density: 1685, power: 3, boil: 158,
    only: [].concat(CONCRETE, ["limestone", "calcium", "bone", "bone_marrow", "zinc", "iron"]),
    reactions: phosReact,
    desc: "Rust remover. Turns rust back into iron and etches concrete, limestone, bone, zinc and iron.",
  });

  // ---- Glacial acetic ----
  makeAcid("glacial_acetic_acid", {
    color: ["#e6f0ec", "#dde9e4", "#eef6f2"], density: 1049, power: 3, boil: 118, alias: "pure vinegar",
    only: ["limestone", "calcium", "bone", "bone_marrow", "plant", "dead_plant", "tree_branch", "grass", "meat", "cooked_meat",
           "head", "body", "paper", "cloth", "plastic", "molten_plastic"],
    reactions: std(0.15),
    desc: "Strong vinegar. Dissolves limestone, bone, plants, flesh, paper and plastic.",
  });

  // ---- Carbonic ----
  makeAcid("carbonic_acid", {
    color: ["#c8e0f4", "#bcd8f0", "#d2e8f8"], density: 1000, power: 1.5, boil: 100, gas: "carbon_dioxide", alias: "soda water",
    only: [].concat(CONCRETE, ["limestone", "calcium", "mudstone", "marble"]),
    reactions: (function () { const r = {}; basesFor(r); return r; })(),
    desc: "Fizzy-water / acid-rain strength. Eats limestone and concrete slowly.",
  });

  // ---- Formic ----
  const formReact = std(0.15);
  formReact.zinc = reaction("hydrogen", null, 0.05); formReact.magnesium = reaction("hydrogen", null, 0.05);
  makeAcid("formic_acid", {
    color: ["#ece0c4", "#e6d8b8", "#f2e8d0"], density: 1220, power: 4, boil: 101, alias: "ant acid",
    only: ["iron", "steel", "aluminum", "tin", "calcium", "limestone", "plant", "dead_plant", "tree_branch", "grass",
           "meat", "cooked_meat", "head", "body", "bone"],
    reactions: formReact,
    desc: "Ant acid. Eats iron, steel, aluminum, tin, plants and flesh. Zinc and magnesium give off hydrogen.",
  });

  // ---- Perchloric ----
  const percOrganics = ["wood", "paper", "cloth", "sugar", "plant", "dead_plant", "tree_branch", "grass", "oil", "alcohol", "wax", "charcoal", "sawdust", "gunpowder"];
  const percReact = std(); percOrganics.forEach(n => { percReact[n] = reaction("explosion", "fire", 0.05); });
  makeAcid("perchloric_acid", {
    color: ["#d8d8ea", "#cecee2", "#e2e2f2"], density: 1664, power: 7, boil: 203,
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, percOrganics), reactions: percReact,
    desc: "Strong oxidizer. Eats metals and rock. Wood, paper, cloth, sugar, oil and other organic things can EXPLODE on contact.",
  });

  // ---- Piranha ----
  makeAcid("piranha_solution", {
    color: ["#b8a0e8", "#ac94e0", "#c4acf0"], density: 1700, power: 8, boil: 150,
    only: ORGANICS.concat(["plastic", "molten_plastic"]), reactions: withWater({}, 0.3),
    desc: "Dissolves everything organic: wood, paper, cloth, flesh, bone, oil, wax and plastic. Metals, glass and rock are safe.",
  });

  // ---- Magic acid ----
  makeAcid("magic_acid", {
    color: ["#e48ad8", "#dc7ed0", "#ec98e2"], density: 1740, power: 12, boil: 120,
    only: FUELS.concat(["plastic", "molten_plastic", "paper", "cloth", "wood", "plant", "dead_plant", "tree_branch", "grass", "charcoal"]),
    desc: "Named because it melts candle wax. Dissolves plastic, wax, oil, glue and fuels fast. Metals, rock and glass are safe.",
  });

  // ---- Stomach ----
  makeAcid("stomach_acid", {
    color: ["#dcdc88", "#d2d27c", "#e4e494"], density: 1010, power: 5, boil: 100,
    only: ["meat", "cooked_meat", "bone", "bone_marrow", "head", "body", "plant", "dead_plant", "grass", "egg", "cheese", "dough", "candy", "sugar", "fiber", "cell"],
    reactions: std(0.1),
    desc: "Dissolves flesh, bone, food and plants. Metals, rock and glass are safe.",
  });

  // ---- Battery (reactions only) ----
  const batReact = std(0.1);
  batReact.zinc = reaction("hydrogen", null, 0.06); batReact.magnesium = reaction("hydrogen", null, 0.06);
  batReact.iron = reaction("hydrogen", null, 0.02);  batReact.steel = reaction("hydrogen", null, 0.015);
  makeReactAcid("battery_acid", {
    color: ["#d6d2a4", "#cecc9a", "#dedaae"], density: 1280, boil: 108, reactions: batReact,
    desc: "Zinc, magnesium and iron fizz into hydrogen gas. Lead plates survive it.",
  });

  // ---- Boric acid (powder that kills bugs) ----
  const boricReact = {};
  ["ant", "termite", "fly", "flea"].forEach(n => { boricReact[n] = reaction(null, "dead_bug", 0.1); });
  elements.boric_acid = {
    color: ["#f6f6f2", "#eeeee8", "#fafaf6"], behavior: behaviors.POWDER, reactions: boricReact, category: "acids",
    state: "solid", density: 1435, tempHigh: 170, stateHigh: "steam",
    desc: "A mild acid powder. Harmless to most things, but kills ants, termites, flies and fleas.",
  };
  rememberChances("boric_acid", boricReact);

  // ---- Hydrobromic / hydroiodic ----
  makeAcid("hydrobromic_acid", {
    color: ["#ece6d6", "#e4ddca", "#f2ecde"], density: 1490, power: 6, boil: 124,
    except: COMMON_SAFE.concat(NOBLE, CERAMICS), reactions: std(),
    desc: "A strong halide acid, like Acid but harder. Metals and rock dissolve. Gold, glass and plastic resist it.",
  });
  makeAcid("hydroiodic_acid", {
    color: ["#e8d6b0", "#e0cca0", "#eedcb8"], density: 1700, power: 7, boil: 127,
    except: COMMON_SAFE.concat(NOBLE, CERAMICS), reactions: std(),
    desc: "The strongest common halide acid. Metals and rock dissolve. Gold, glass and plastic resist it.",
  });

  // ---- Chromic ----
  const chromFuels = ["alcohol", "oil", "wood", "paper", "cloth", "sugar", "plant", "dead_plant", "grass", "tree_branch", "gunpowder", "wax", "sawdust"];
  const chromReact = std(); chromFuels.forEach(n => { chromReact[n] = reaction("fire", "fire", 0.08); });
  makeAcid("chromic_acid", {
    color: ["#e0501e", "#d44818", "#ea5c26"], density: 1670, power: 7, boil: 250,
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, chromFuels), reactions: chromReact,
    desc: "Strong oxidizer. Eats metals and rock. Alcohol, oil, wood and paper that touch it can catch FIRE.",
  });

  // ---- Red fuming nitric (rocket oxidizer) ----
  const rfnaFuels = ["alcohol", "oil", "gasoline", "diesel", "kerosene", "wood", "paper", "cloth", "sugar", "plant", "dead_plant", "grass", "tree_branch", "propane", "methane", "sawdust", "wax"];
  const rfnaReact = std();
  nitMetals.forEach(n => { rfnaReact[n] = reaction(null, "nitrogen_dioxide", 0.3); });
  rfnaFuels.forEach(n => { rfnaReact[n] = reaction("explosion", "fire", 0.25); });
  makeAcid("red_fuming_nitric_acid", {
    color: ["#d9622b", "#cc5822", "#e26c34"], density: 1550, power: 9, boil: 83, gas: "nitrogen_dioxide", alias: "RFNA",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["iron", "steel", "aluminum", "tungsten"], nitMetals, rfnaFuels), reactions: rfnaReact,
    desc: "Rocket oxidizer. Fuels, oil, alcohol, wood and paper EXPLODE when they touch it. Eats copper, zinc and more.",
  });

  // ---- Triflic acid ----
  makeAcid("triflic_acid", {
    color: ["#aee0ff", "#a0d8fa", "#bce8ff"], density: 1700, power: 10, boil: 162,
    except: COMMON_SAFE.concat(NOBLE), reactions: std(),
    desc: "A superacid that does NOT eat glass or plastic. Metals, rock and organic things dissolve fast.",
  });

  // ---- Sulfamic acid (descaler) ----
  const sulfamReact = std(0.1); sulfamReact.rust = rustToIron();
  makeAcid("sulfamic_acid", {
    color: ["#e8eef2", "#dfe7ec", "#f0f5f8"], density: 1300, power: 3.5, boil: 130,
    only: [].concat(CONCRETE, ["limestone", "calcium", "bone", "bone_marrow", "mudstone"]), reactions: sulfamReact,
    desc: "Descaler. Dissolves limestone, calcium and concrete. Turns rust back into iron.",
  });

  // =========================== FAKE / FANTASY ACIDS ===========================
  // ---- Alien acid ----
  makeAcid("alien_acid", {
    color: ["#2f4a1c", "#263d16", "#3a5a22"], density: 1800, power: 30, boil: 400, alias: "xenomorph blood",
    except: [].concat(ACID_NAMES, ["fire", "smoke", "steam", "wall"]),
    desc: "Eats through ABSOLUTELY everything, even plastic and pipes. Extremely fast.",
  });

  // ---- Midas acid ----
  const midasReact = {}; METALS.forEach(n => { midasReact[n] = reaction(null, "gold", 0.25); });
  makeReactAcid("midas_acid", { color: ["#ffe45c", "#ffd83a", "#fff07a"], density: 1500, reactions: midasReact,
    desc: "Turns metals into GOLD." });

  // ---- Rust acid ----
  const rustReact = {}; ["iron", "steel", "tin", "zinc", "copper", "nickel", "brass", "bronze"].forEach(n => { rustReact[n] = reaction(null, "rust", 0.3); });
  rustReact.rust = reaction(undefined, null, 0.3);   // rust flakes away, acid kept, so metal underneath is exposed
  makeReactAcid("rust_acid", { color: ["#c8743a", "#bc6830", "#d4804a"], density: 1300, reactions: rustReact,
    desc: "Turns metals into RUST, and flakes the rust away to reach the metal underneath. Keeps eating down." });

  // ---- Petrify acid ----
  const petReact = {}; ORGANICS.concat(["dirt", "mud", "plant", "snow"]).forEach(n => { petReact[n] = reaction(null, "rock", 0.25); });
  makeReactAcid("petrify_acid", { color: ["#9a9aa6", "#8e8e9a", "#a6a6b2"], density: 1400, reactions: petReact,
    desc: "Turns living and organic things into ROCK." });

  // ---- Ash acid ----
  const ashReact = {}; ORGANICS.forEach(n => { ashReact[n] = reaction(null, "ash", 0.3); });
  makeReactAcid("ash_acid", { color: ["#6a6a6a", "#5e5e5e", "#767676"], density: 1200, reactions: ashReact,
    desc: "Turns organic things into ASH without any fire." });

  // ---- Melting acid ----
  const meltReact = {};
  ordinary(isSolid).forEach(n => { meltReact[n] = reaction(null, undefined, 0.6, { temp2: 800 }); });
  makeReactAcid("melting_acid", { color: ["#ff7a1a", "#ff6a0a", "#ff8a2a"], density: 1600, boil: 1500, reactions: meltReact,
    desc: "Heats whatever it touches by hundreds of degrees until it melts." });

  // ---- Cryo acid ----
  const cryoReact = {};
  ordinary(e => isSolid(e) || e.state === "liquid").forEach(n => { cryoReact[n] = reaction(null, undefined, 0.5, { temp2: -150 }); });
  ["water", "salt_water", "dirty_water", "sugar_water", "pool_water"].forEach(n => { cryoReact[n] = reaction(null, "ice", 0.6, { temp2: -150 }); });
  makeReactAcid("cryo_acid", { color: ["#7ae8ff", "#6adcf6", "#8af0ff"], density: 1100, boil: 60, reactions: cryoReact,
    desc: "Freezes whatever it touches. Water turns to ice." });

  // ---- Chaos acid ----
  const pool = ["gold", "rust", "ice", "glass", "rock", "sand", "wood", "iron", "copper", "brick", "plastic", "dirt", "salt", "sugar",
                "ash", "gravel", "steel", "slime", "lead", "tin", "snow", "bone", "paper"].filter(exists);
  const chaosReact = {};
  ordinary(isSolid).forEach(n => { chaosReact[n] = reaction(null, pool, 0.15); });
  makeReactAcid("chaos_acid", { color: ["#ff4ad8", "#4aff7a", "#4a7aff", "#ffe04a"], density: 1250, reactions: chaosReact,
    desc: "Turns solids into random other materials." });

  // ---- Virus acid: a LIQUID that infects its neighbours EVERY tick. It is very thick, so it clings and climbs. ----
  const N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  function pxAt(x, y) { return (pixelMap[x] && pixelMap[x][y]) || null; }
  let virusTargets = null;
  function virusSet() {                         // built the first time it is needed, after the game has finished starting up
    if (!virusTargets) {
      virusTargets = {};
      ordinary(e => isSolid(e) || e.state === "liquid").forEach(n => { if (WATERS.indexOf(n) === -1) virusTargets[n] = true; });   // water is immune, so Neutralizer can win
      ACID_NAMES.forEach(function (n) {           // the viruses eat every other acid as well, even the strongest ones
        const e = elements[n];
        if (e && n !== "virus_acid" && n !== "virus_goo" && e.state !== "gas") virusTargets[n] = true;
      });
    }
    return virusTargets;
  }
  // Both viruses infect their neighbours EVERY tick (3 tries per tick). Infected pixels become more of the same virus.
  function virusTick(kind) {
    return function (pixel) {
      const targets = virusSet();
      const chance = Math.min(1, 0.5 * SPEEDUP * POWER);
      for (let k = 0; k < 3; k++) {
        const d = N8[Math.floor(Math.random() * 8)];
        const q = pxAt(pixel.x + d[0], pixel.y + d[1]);
        if (q && !q.del && targets[q.element] && Math.random() < chance) changePixel(q, kind);
      }
    };
  }
  // Virus Acid: a real LIQUID. It pours and flows and eats through anything it lands on, very fast.
  elements.virus_acid = {
    color: ["#a8ff2a", "#7aff00", "#c4ff5a"],
    behavior: behaviors.LIQUID,
    category: "acids", state: "liquid", density: 1500, viscosity: 3000, stain: 0.2,   // a bit thick, like slime
    tick: virusTick("virus_acid"),
    desc: "A thick green liquid that turns whatever it touches into MORE of itself, very fast. Walls and pipes stop it. Acid Neutralizer kills it. (A liquid cannot climb: for that, use Virus Goo.)",
  };
  // Virus Goo: the same virus, but it stays exactly where it is, so it CLIMBS up walls and across ceilings.
  elements.virus_goo = {
    color: ["#8ae01a", "#6ec800", "#a0f030"],
    behavior: behaviors.WALL,
    category: "acids", state: "solid", density: 1500, stain: 0.2,
    tick: virusTick("virus_goo"),
    desc: "Sticky virus that never moves, so it CLIMBS up walls and over ceilings, eating everything it touches. Walls and pipes stop it. Acid Neutralizer kills it.",
  };

  // ---- Acid neutralizer ----
  const neutReact = {};
  ACID_NAMES.concat(["virus_acid"]).filter(n => n !== "acid_neutralizer").forEach(n => { neutReact[n] = reaction(null, "water", 0.6); });
  makeReactAcid("acid_neutralizer", { color: ["#9ad0ff", "#8ec8fa", "#a6d8ff"], density: 1050, boil: 100, gas: "steam", reactions: neutReact,
    desc: "A base. Turns any acid (even Virus Acid) into water." });

  // =========================== MORE ACIDS (v6) ===========================
  const keepHalf = n => [n, null];            // the acid survives about half the time it reacts

  // ---- Mixed acid (nitrating acid): turns cloth/paper/wood/sugar into gunpowder ----
  const gunStuff = ["cloth", "paper", "wood", "sugar", "sawdust", "cotton"];
  const mixReact = std(); gunStuff.forEach(n => { mixReact[n] = reaction(null, "gunpowder", 0.3); });
  nitMetals.forEach(n => { mixReact[n] = reaction(null, "nitrogen_dioxide", 0.3); });
  makeAcid("mixed_acid", {
    color: ["#d8a838", "#cc9c30", "#e2b444"], density: 1700, power: 9, boil: 120, gas: "nitrogen_dioxide", alias: "nitrating acid",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["iron", "steel", "aluminum", "tungsten"], nitMetals, gunStuff), reactions: mixReact,
    desc: "Nitric + sulfuric acid. Turns cloth, paper, wood and sugar into GUNPOWDER. Eats copper, zinc and rock.",
  });

  // ---- Peracetic acid (disinfectant) ----
  const periReact = std(0.2); ["ant", "termite", "fly", "flea", "bee", "firefly", "worm"].forEach(n => { periReact[n] = reaction(null, "dead_bug", 0.5); });
  makeAcid("peracetic_acid", {
    color: ["#e8f4e0", "#dcecd2", "#f0f8ea"], density: 1100, power: 8, boil: 105,
    only: ["cell", "cancer", "yeast", "dough", "cheese"], reactions: periReact,
    desc: "Disinfectant. Kills cells, yeast and bugs. Metals, rock and glass are safe.",
  });

  // ---- Oleum (fuming sulfuric acid) ----
  const oleumReact = std(); oleumReact.water = reaction("steam", "steam", 0.5);
  ["sugar", "wood", "paper", "cloth", "plant", "dead_plant", "tree_branch", "grass"].forEach(n => { oleumReact[n] = reaction(null, "charcoal", 0.4); });
  makeAcid("oleum", {
    color: ["#f2ea9a", "#ece28c", "#f6f0aa"], density: 1900, power: 10, boil: 45, alias: "fuming sulfuric acid",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["sugar", "wood", "paper", "cloth", "plant", "dead_plant", "tree_branch", "grass"]),
    reactions: oleumReact,
    desc: "Fuming sulfuric acid. Faster and nastier than sulfuric. Water makes it flash into steam.",
  });

  // ---- Growth acid ----
  const growReact = {};
  growReact.dirt = reaction(keepHalf("growth_acid"), "grass", 0.25);
  growReact.mud = reaction(keepHalf("growth_acid"), "grass", 0.25);
  growReact.sand = reaction(keepHalf("growth_acid"), "dirt", 0.2);
  growReact.gravel = reaction(keepHalf("growth_acid"), "dirt", 0.2);
  growReact.rock = reaction(keepHalf("growth_acid"), "dirt", 0.15);
  growReact.grass = reaction(keepHalf("growth_acid"), "plant", 0.15);
  makeReactAcid("growth_acid", { color: ["#5ad84a", "#48c83a", "#6ae85a"], density: 1050, reactions: growReact,
    desc: "Life! Rock and sand weather to dirt, dirt and mud turn to grass, grass grows into plants." });

  // ---- Magma acid ----
  const magmaReact = {}; ordinary(isSolid).forEach(n => { magmaReact[n] = reaction(null, "magma", 0.25); });
  makeReactAcid("magma_acid", { color: ["#ff4a0a", "#f03c00", "#ff5a1a"], density: 2200, boil: 3000, reactions: magmaReact,
    desc: "Turns solids into MAGMA." });

  // ---- Glass acid ----
  const glassReact = {};
  ["sand", "wet_sand", "packed_sand", "dirt", "mud", "clay", "clay_soil", "rock", "gravel", "brick", "sandstone", "concrete"].forEach(n => { glassReact[n] = reaction(keepHalf("glass_acid"), "glass", 0.25); });
  makeReactAcid("glass_acid", { color: ["#b8e8f8", "#a8dcf0", "#c8f0fc"], density: 1300, reactions: glassReact,
    desc: "Turns sand, dirt, clay, rock, brick and concrete into GLASS." });

  // ---- Slime acid ----
  const slimeReact = {}; ordinary(isSolid).forEach(n => { slimeReact[n] = reaction(null, "slime", 0.25); });
  makeReactAcid("slime_acid", { color: ["#6ad86a", "#5ac85a", "#7ae87a"], density: 1250, reactions: slimeReact,
    desc: "Turns solids into slime." });

  // ---- Blast acid ----
  const blastReact = {}; ordinary(e => isSolid(e) || e.state === "liquid").forEach(n => { blastReact[n] = reaction(null, "explosion", 0.06); });
  makeReactAcid("blast_acid", { color: ["#ff3a3a", "#f02a2a", "#ff4a4a"], density: 1400, boil: 400, reactions: blastReact,
    desc: "Whatever it touches EXPLODES. Pour carefully." });

  // ---- Hellfire acid ----
  const hellReact = {}; ordinary(e => isSolid(e) || e.state === "liquid").forEach(n => { hellReact[n] = reaction(keepHalf("hellfire_acid"), "fire", 0.3); });
  makeReactAcid("hellfire_acid", { color: ["#ff8a00", "#ff7000", "#ffa020"], density: 1200, boil: 2000, reactions: hellReact,
    desc: "Whatever it touches bursts into FIRE." });

  // ---- Clone acid: the acid turns INTO whatever it touches, so there is one more of it ----
  const cloneReact = {};
  ordinary(e => isSolid(e) || e.state === "liquid").forEach(n => { cloneReact[n] = reaction(n, undefined, 0.2); });
  makeReactAcid("clone_acid", { color: ["#ffb8f0", "#f8a8e8", "#ffc8f6"], density: 1150, reactions: cloneReact,
    desc: "DUPLICATES whatever it touches. The acid turns into a copy." });

  // ---- Repair acid ----
  const repairReact = {};
  [["concrete_rubble", "concrete"], ["rust", "iron"], ["ash", "wood"], ["dead_plant", "plant"], ["glass_shard", "glass"],
   ["porcelain_shard", "porcelain"], ["clay_shard", "clay"], ["brick_rubble", "brick"], ["rad_shard", "rad_glass"], ["gravel", "rock"],
   ["sawdust", "wood"], ["charcoal", "wood"]]
    .forEach(p => { repairReact[p[0]] = reaction(keepHalf("repair_acid"), p[1], 0.3); });
  makeReactAcid("repair_acid", { color: ["#fff4a0", "#f8ec90", "#fffab0"], density: 1100, reactions: repairReact,
    desc: "Fixes things. Rubble becomes concrete, rust becomes iron, ash becomes wood, broken glass becomes glass." });

  // ---- Diamond acid ----
  const diaReact = {}; ["charcoal", "coal", "graphite", "carbon"].forEach(n => { diaReact[n] = reaction(keepHalf("diamond_acid"), "diamond", 0.25); });
  makeReactAcid("diamond_acid", { color: ["#d8f4ff", "#c8ecfc", "#e4f8ff"], density: 1200, reactions: diaReact,
    desc: "Squeezes charcoal into DIAMOND." });

  // =========================== EVEN MORE ACIDS (v7) ===========================
  // ---- real ----
  makeAcid("fuming_hydrochloric_acid", {
    color: ["#e6f0a8", "#dce8a0", "#eef6b4"], density: 1190, power: 10, boil: 40, gas: "acid_gas", alias: "fuming muriatic acid",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS), reactions: std(),
    desc: "Concentrated hydrochloric acid that smokes in the air. Stronger than the game's Acid. Gold, glass and plastic resist it.",
  });
  const lactReact = std(0.1);
  makeAcid("lactic_acid", {
    color: ["#f4efe0", "#ece6d4", "#f8f4e8"], density: 1210, power: 3, boil: 122, alias: "sour milk acid",
    only: ["limestone", "calcium", "bone", "bone_marrow", "cheese", "egg", "mudstone"], reactions: lactReact,
    desc: "Sour milk acid. Dissolves limestone, calcium, bone, cheese and eggs. Metals and rock are safe.",
  });
  const oxReact = std(0.1); oxReact.rust = reaction(null, "iron", 0.35);
  makeAcid("oxalic_acid", {
    color: ["#f2f2ee", "#eaeae4", "#f6f6f2"], density: 1900, power: 3, boil: 150, alias: "wood bleach",
    only: ["limestone", "calcium", "bone", "bone_marrow", "mudstone"], reactions: oxReact,
    desc: "Strips rust back to clean iron and dissolves limestone, calcium and bone.",
  });
  const prussicReact = {};
  ["ant", "termite", "fly", "flea", "bee", "firefly", "worm"].forEach(n => { prussicReact[n] = reaction(null, "dead_bug", 0.6); });
  ["cell", "cancer", "yeast"].forEach(n => { prussicReact[n] = reaction(null, null, 0.6); });
  ["plant", "grass", "tree_branch", "vine"].forEach(n => { prussicReact[n] = reaction(null, "dead_plant", 0.4); });
  makeReactAcid("prussic_acid", { color: ["#d8e8d0", "#cfe0c6", "#e0f0d8"], density: 700, boil: 26, reactions: prussicReact, alias: "hydrocyanic acid",
    desc: "A poison. Kills bugs, cells, yeast and plants fast. Harmless to everything else." });
  const carbReact2 = std(0.15);
  ["ant", "termite", "fly", "flea", "bee", "worm"].forEach(n => { carbReact2[n] = reaction(null, "dead_bug", 0.5); });
  carbReact2.cell = reaction(null, null, 0.5);
  makeAcid("carbolic_acid", {
    color: ["#f0d8d8", "#e8cece", "#f6e0e0"], density: 1070, power: 4, boil: 182, alias: "phenol",
    only: ["plastic", "molten_plastic"], reactions: carbReact2,
    desc: "Old-fashioned disinfectant. Kills bugs and cells and slowly dissolves plastic.",
  });

  // ---- fake: converter acids ----
  function makeConvertAcid(name, o) {
    const targets = Array.isArray(o.targets) ? o.targets : ordinary(o.targets === "all" ? (e => isSolid(e) || e.state === "liquid") : isSolid);
    const r = {};
    targets.forEach(n => { if (n !== o.product && !(o.skip && o.skip.indexOf(n) !== -1)) r[n] = reaction(o.keep === false ? null : keepHalf(name), o.product, o.chance || 0.25); });
    makeReactAcid(name, { color: o.color, density: o.density || 1200, reactions: r, boil: o.boil, desc: o.desc });
  }
  makeConvertAcid("timber_acid", { color: ["#a8743c", "#9c6a34", "#b48044"], product: "wood", targets: ["dirt", "mud", "sand", "ash", "charcoal", "sawdust", "dead_plant", "grass", "gravel", "clay"],
    desc: "Turns dirt, mud, sand, ash, charcoal and dead plants into WOOD." });
  makeConvertAcid("foam_acid", { color: ["#f4f8ff", "#e8f0fc", "#fcfeff"], product: "foam", targets: "all", keep: false,
    desc: "Turns whatever it touches into FOAM." });
  makeConvertAcid("salt_acid", { color: ["#f0f0f0", "#e4e4e4", "#fafafa"], product: "salt", targets: "solids",
    desc: "Turns solids into SALT." });
  makeConvertAcid("sweet_acid", { color: ["#ff9ad0", "#f88cc4", "#ffa8dc"], product: "sugar", targets: "solids",
    desc: "Turns solids into SUGAR." });
  makeConvertAcid("dirt_acid", { color: ["#7a5230", "#6e4828", "#865c38"], product: "dirt", targets: "all",
    desc: "Turns whatever it touches into DIRT." });
  makeConvertAcid("sand_acid", { color: ["#e8d890", "#e0cf84", "#f0e09c"], product: "sand",
    targets: ["rock", "gravel", "brick", "glass", "concrete", "sandstone", "limestone", "porcelain", "clay", "concrete_rubble", "brick_rubble", "glass_shard", "mudstone", "slag"],
    desc: "EROSION. Turns rock, brick, glass, concrete and more into SAND." });
  const vaporReact = {};
  ordinary(isSolid).forEach(n => { vaporReact[n] = reaction(null, "smoke", 0.3); });
  ordinary(e => e.state === "liquid").forEach(n => { vaporReact[n] = reaction(null, "steam", 0.4); });
  makeReactAcid("vapor_acid", { color: ["#cfd8e0", "#c4ced8", "#d8e0e8"], density: 1050, boil: 60, reactions: vaporReact,
    desc: "Evaporates whatever it touches: solids to smoke, liquids to steam." });
  const shockReact = {}; METALS.concat(["gold", "silver", "tungsten"]).forEach(n => { shockReact[n] = reaction("electric", undefined, 0.35); });
  makeReactAcid("shock_acid", { color: ["#ffee55", "#ffe640", "#fff566"], density: 1300, boil: 300, reactions: shockReact,
    desc: "Fizzes into electric sparks whenever it touches metal." });
  makeConvertAcid("oil_acid", { color: ["#3a2a1a", "#30220f", "#443020"], product: "oil", targets: "all",
    desc: "Turns whatever it touches into OIL. Keep it away from fire." });
  makeConvertAcid("aqua_acid", { color: ["#4a9aff", "#3c8cf4", "#5aa8ff"], product: "water", targets: "solids",
    desc: "Turns solids into WATER." });
  makeConvertAcid("steel_acid", { color: ["#9aa4ae", "#8e98a2", "#a6b0ba"], product: "steel", targets: "solids",
    desc: "Turns solids into STEEL." });
  makeConvertAcid("plastic_acid", { color: ["#ff6ad8", "#f45cc8", "#ff7ae0"], product: "plastic", targets: "solids",
    desc: "Turns solids into PLASTIC." });
  makeConvertAcid("brick_acid", { color: ["#c8503a", "#bc4630", "#d45c44"], product: "brick", targets: "solids",
    desc: "Turns solids into BRICK." });

  // =========================== MORE REAL ACIDS AND PURPOSE ACIDS (v8) ===========================
  // ---- real ----
  const csReact = std(0.2); csReact.water = reaction(["steam", "steam", "explosion"], "steam", 0.4);   // violent with water
  makeAcid("chlorosulfonic_acid", {
    color: ["#f0ece0", "#e8e4d6", "#f6f2e8"], density: 1750, power: 12, boil: 152,
    except: COMMON_SAFE.concat(CERAMICS).filter(n => WATERS.indexOf(n) === -1), reactions: csReact,
    desc: "Reacts VIOLENTLY with water: steam and explosions. Eats metals, rock and organic things. Glass and plastic resist it.",
  });
  makeAcid("ferric_chloride", {
    color: ["#7a5a1a", "#6e5016", "#866420"], density: 1400, power: 5, boil: 316, alias: "metal etchant",
    only: ["copper", "brass", "bronze", "iron", "steel", "zinc", "tin", "nickel", "aluminum", "magnesium", "lead", "silver"], reactions: std(0.1),
    desc: "Metal etchant. Eats ONLY metals (gold resists it). Rock, wood, flesh, glass and plastic are safe.",
  });
  makeAcid("drain_cleaner", {
    color: ["#b0e0f0", "#a4d8ea", "#bce8f6"], density: 1830, power: 10, boil: 290,
    only: ORGANICS, reactions: std(0.1),
    desc: "Dissolves ONLY organic things: wood, paper, cloth, flesh, bone, oil, wax. Metals, rock, glass and plastic are safe.",
  });
  const malReact = std(0.1); malReact.rust = reaction(null, "iron", 0.2);
  makeAcid("malic_acid", {
    color: ["#d8e8b0", "#cfe0a4", "#e0f0bc"], density: 1600, power: 1.5, boil: 150, alias: "apple acid",
    only: ["limestone", "calcium", "mudstone"], reactions: malReact,
    desc: "Mild apple acid. Slowly descales limestone and calcium and turns a little rust back into iron.",
  });
  makeAcid("tartaric_acid", {
    color: ["#e8d0e0", "#e0c4d8", "#f0dae8"], density: 1790, power: 3, boil: 210, alias: "wine acid",
    only: ["copper", "brass", "bronze", "limestone", "calcium"], reactions: std(0.1),
    desc: "Wine acid. Slowly eats copper, brass and bronze (a copper cleaner) and limestone. Everything else is safe.",
  });
  const ascReact = std(0.1); ascReact.rust = reaction(null, "iron", 0.4);
  makeAcid("ascorbic_acid", {
    color: ["#fff2b0", "#fae8a0", "#fffac0"], density: 1650, power: 1, boil: 190, alias: "vitamin C",
    only: ["cell", "cancer"], reactions: ascReact,
    desc: "Vitamin C. A very good rust remover: rust turns back into iron. Dissolves cells.",
  });
  const salReact = std(0.1);
  makeAcid("salicylic_acid", {
    color: ["#f4ece4", "#ece2d8", "#faf2ec"], density: 1440, power: 4, boil: 211, alias: "aspirin acid",
    only: ["cell", "cancer", "yeast", "dough"], reactions: salReact,
    desc: "Aspirin acid. Dissolves cells, cancer and yeast. Everything else is safe.",
  });

  // ---- purpose acids ----
  const weedReact = {};
  ["plant", "grass", "tree_branch", "vine", "flower", "mushroom", "algae", "seed", "sapling"].forEach(n => { weedReact[n] = reaction(keepHalf("weed_killer"), "dead_plant", 0.5); });
  makeReactAcid("weed_killer", { color: ["#c8a850", "#bc9c46", "#d4b45a"], density: 1050, reactions: weedReact, boil: 100,
    desc: "Herbicide. Kills plants, grass, vines and flowers fast and leaves everything else alone." });
  const retReact = {};
  ["fire", "smoke"].forEach(n => { retReact[n] = reaction(keepHalf("fire_retardant"), null, 0.8); });
  retReact.magma = reaction(keepHalf("fire_retardant"), "basalt", 0.2);
  makeReactAcid("fire_retardant", { color: ["#ff6a6a", "#f45c5c", "#ff7a7a"], density: 1100, reactions: retReact, boil: 140,
    desc: "Puts out fire and smoke on contact (and cools magma into rock). Pour it on a blaze." });
  const deiceReact = {};
  ["ice", "snow", "packed_snow", "slush", "frozen_water", "permafrost"].forEach(n => { deiceReact[n] = reaction(keepHalf("deicer"), "water", 0.6); });
  makeReactAcid("deicer", { color: ["#e0f0ff", "#d4e8fa", "#ecf6ff"], density: 1150, reactions: deiceReact, boil: 110,
    desc: "Melts ice and snow into water." });
  function makeDyeAcid(name, hex, label) {
    const r = {};
    ordinary(isSolid).forEach(n => { r[n] = reaction(null, undefined, 0.5, { color2: hex }); });
    makeReactAcid(name, { color: [hex], density: 1100, reactions: r, desc: "Dye. Paints whatever it touches " + label + ". Each acid pixel paints one pixel." });
  }
  makeDyeAcid("dye_red", "#e02828", "RED");
  makeDyeAcid("dye_blue", "#2850e0", "BLUE");
  makeDyeAcid("dye_green", "#28c040", "GREEN");
  makeDyeAcid("dye_black", "#1c1c1c", "BLACK");
  makeDyeAcid("dye_white", "#f4f4f4", "WHITE");
  const fumeReact = {}; ordinary(isSolid).forEach(n => { fumeReact[n] = reaction(null, ["methane", "hydrogen"], 0.2); });
  makeReactAcid("fume_acid", { color: ["#c8ff4a", "#bcf43c", "#d4ff5a"], density: 1250, reactions: fumeReact, boil: 90,
    desc: "Turns solids into explosive gas (methane and hydrogen). Keep it away from fire." });

  // =========================== MORE ACIDS (v10) ===========================
  // ---- real ----
  makeAcid("selenic_acid", {
    color: ["#e8e0c8", "#e0d8bc", "#f0e8d2"], density: 2600, power: 7, boil: 260,
    except: COMMON_SAFE.concat(["diamond"], CERAMICS), reactions: std(),
    desc: "Like Aqua Regia, it dissolves GOLD, plus metals and rock. Glass, plastic and diamond resist it.",
  });
  const hypoReact = {}; basesFor(hypoReact);
  hypoReact.dirty_water = reaction(keepHalf("hypochlorous_acid"), "water", 0.5);
  ["cell", "cancer", "yeast"].forEach(n => { hypoReact[n] = reaction(null, null, 0.5); });
  ["ant", "termite", "fly", "flea", "bee", "worm"].forEach(n => { hypoReact[n] = reaction(null, "dead_bug", 0.5); });
  makeReactAcid("hypochlorous_acid", { color: ["#e8f6c8", "#def0b8", "#f0fad4"], density: 1070, boil: 100, reactions: hypoReact,
    desc: "Disinfectant. Purifies dirty water into clean water and kills bugs, cells and yeast." });
  const sulfurousReact = {}; basesFor(sulfurousReact);
  ["cloth", "paper", "wood", "sawdust", "plant", "grass", "dead_plant", "sugar"].forEach(n => { sulfurousReact[n] = reaction(null, undefined, 0.4, { color2: "#f2f2f2" }); });
  ["cell", "cancer", "yeast"].forEach(n => { sulfurousReact[n] = reaction(null, null, 0.5); });
  makeReactAcid("sulfurous_acid", { color: ["#f4f4e0", "#eaeed4", "#fafaea"], density: 1030, boil: 100, alias: "bleach acid", reactions: sulfurousReact,
    desc: "Bleach. Turns cloth, paper, wood and plants white and kills cells and yeast." });
  const gallicReact = {}; basesFor(gallicReact);
  ["iron", "steel"].forEach(n => { gallicReact[n] = reaction(null, undefined, 0.3, { color2: "#1c1c24" }); });
  makeReactAcid("gallic_acid", { color: ["#d8c8a8", "#d0c09c", "#e0d0b4"], density: 1690, boil: 210, alias: "iron-gall ink", reactions: gallicReact,
    desc: "Old-fashioned ink. Turns iron and steel BLACK." });
  const tannicReact = {}; basesFor(tannicReact);
  tannicReact.rust = reaction(null, "iron", 0.3);
  tannicReact.wood = reaction(keepHalf("tannic_acid"), undefined, 0.3, { color2: "#6b4a2a" });
  makeReactAcid("tannic_acid", { color: ["#b88a52", "#ac8048", "#c4965c"], density: 1100, boil: 200, reactions: tannicReact,
    desc: "Rust converter and wood stain: rust turns back into iron and wood turns dark brown." });

  // ---- fake ----
  const metalsToMake = function (name, product, color, desc) {
    const r = {}; METALS.concat(["gold"]).forEach(n => { if (n !== product) r[n] = reaction(null, product, 0.25); });
    makeReactAcid(name, { color: color, density: 1500, reactions: r, desc: desc });
  };
  metalsToMake("silver_acid", "silver", ["#d8dce0", "#ccd2d8", "#e4e8ec"], "Turns metals into SILVER.");
  metalsToMake("copper_acid", "copper", ["#d88a4a", "#cc7e40", "#e49656"], "Turns metals into COPPER.");
  makeConvertAcid("mud_acid", { color: ["#6a4a30", "#5e4028", "#765638"], product: "mud", targets: "solids", desc: "Turns solids into MUD." });
  makeConvertAcid("snow_acid", { color: ["#f0f8ff", "#e4f0fa", "#fafdff"], product: "snow", targets: "all", desc: "Turns whatever it touches into SNOW." });
  const shatterReact = {};
  [["glass", "glass_shard"], ["stained_glass", "glass_shard"], ["rad_glass", "rad_shard"], ["brick", "brick_rubble"], ["porcelain", "porcelain_shard"],
   ["rock", "gravel"], ["concrete", "concrete_rubble"], ["reinforced_concrete", "concrete_rubble"], ["limestone", "gravel"], ["sandstone", "sand"], ["clay", "clay_shard"]]
    .forEach(p => { shatterReact[p[0]] = reaction(keepHalf("shatter_acid"), p[1], 0.3); });
  CONCRETE.forEach(n => { if (!shatterReact[n] && !/_mix$|_cement$|^cement$|^liquid_concrete$|rubble/.test(n)) shatterReact[n] = reaction(keepHalf("shatter_acid"), "concrete_rubble", 0.3); });
  makeReactAcid("shatter_acid", { color: ["#a0c8e8", "#94bede", "#acd2f0"], density: 1200, reactions: shatterReact,
    desc: "Demolition acid. Glass, brick, rock and concrete SHATTER into shards, rubble and gravel instead of dissolving." });

  // =========================== ACID FIGHTS (v10) ===========================
  // Stronger acids EAT weaker acids on contact. Equal acids destroy each other. The top acids kill the viruses.
  const TIER = {
    alien_acid: 5, superacid: 5, superacid_concrete_safe: 5, triflic_acid: 5, magic_acid: 5,
    aqua_regia: 4, red_fuming_nitric_acid: 4, oleum: 4, chlorosulfonic_acid: 4, fuming_hydrochloric_acid: 4, perchloric_acid: 4, chromic_acid: 4,
    hydroiodic_acid: 4, piranha_solution: 4, hydrofluoric_acid: 4, mixed_acid: 4, selenic_acid: 4,
    acid: 3, sulfuric_acid: 3, nitric_acid: 3, hydrobromic_acid: 3, ferric_chloride: 3, drain_cleaner: 3,
    citric_acid: 1, lactic_acid: 1, malic_acid: 1, tartaric_acid: 1, ascorbic_acid: 1, salicylic_acid: 1, carbonic_acid: 1, vinegar: 1, boric_acid: 1,
    dye_red: 1, dye_blue: 1, dye_green: 1, dye_black: 1, dye_white: 1, weed_killer: 1, fire_retardant: 1, deicer: 1, acid_neutralizer: 1,
    hypochlorous_acid: 1, sulfurous_acid: 1, gallic_acid: 1, tannic_acid: 1,
  };                                              // everything else is tier 2
  const NO_FIGHT = ["acid_gas", "acid_cloud", "neutral_acid", "virus_acid", "virus_goo"];
  function tierOf(n) { return TIER[n] !== undefined ? TIER[n] : 2; }
  const fighters = ACID_NAMES.concat(["vinegar"]).filter(function (n, i, arr) {
    const e = elements[n];
    return !!e && arr.indexOf(n) === i && NO_FIGHT.indexOf(n) === -1 && e.state !== "gas";
  });
  function addFight(A, B, r, chance) {
    const ea = elements[A];
    ea.reactions = ea.reactions || {};
    if (ea.reactions[B]) return;                  // keep special recipes (nitric + acid = aqua regia, neutralizer...)
    ea.reactions[B] = r;
    if (reactAcids[A]) reactAcids[A].base[B] = chance;
  }
  fighters.forEach(function (A) {
    fighters.forEach(function (B) {
      if (A === B) return;
      const ta = tierOf(A), tb = tierOf(B);
      if (ta > tb) {
        const diff = ta - tb, chance = diff >= 3 ? 0.5 : (diff === 2 ? 0.35 : 0.2);
        addFight(A, B, reaction(diff >= 3 ? [A, A, A, null] : [A, A, null], null, chance), chance);   // A usually survives, B is destroyed
      } else if (ta === tb && A < B) {
        addFight(A, B, reaction(null, null, 0.05), 0.05);                                              // equals destroy each other
        addFight(B, A, reaction(null, null, 0.05), 0.05);
      }
    });
  });
  ["virus_acid", "virus_goo"].forEach(function (V) {
    fighters.forEach(function (A) { if (tierOf(A) >= 5) addFight(A, V, reaction([A, A, null], null, 0.3), 0.3); });
  });
  Object.keys(reactAcids).forEach(function (n) { applyChances(n); });

  // ---------------- make the game's own acid and every acid here leave each other alone ----------------
  if (elements.acid && Array.isArray(elements.acid.ignore)) {
    ACID_NAMES.filter(n => ["acid", "neutral_acid", "acid_gas", "acid_cloud", "nitric_acid"].indexOf(n) === -1)
      .forEach(n => { if (elements.acid.ignore.indexOf(n) === -1) elements.acid.ignore.push(n); });
    PLASTICS.forEach(n => { if (elements.acid.ignore.indexOf(n) === -1) elements.acid.ignore.push(n); });   // acid-proof concretes live in this list
    if (elements.acid_gas) elements.acid_gas.ignore = elements.acid.ignore;
  }
  if (elements.acid) {                                   // the game's acid + nitric acid -> aqua regia
    elements.acid.reactions = elements.acid.reactions || {};
    elements.acid.reactions.nitric_acid = reaction("aqua_regia", "aqua_regia");
    elements.acid.reactions.acid_neutralizer = reaction(null, "water", 0.6);   // neutralizer works on the game's acid too
  }

  // ================= IN-GAME ACID GUIDE =================
  function nice(n) { return n.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  const EXTRA = {
    acid: "The game's own Acid (hydrochloric acid). Dissolves most things except gold, glass, plastic and a few others. Mix it with Nitric Acid to make Aqua Regia.",
    vinegar: "The game's own Vinegar, a weak acetic acid.",
    aqua_regia: "HOW TO MAKE IT: touch Nitric Acid to the game's Acid.",
    mixed_acid: "HOW TO MAKE IT: touch Nitric Acid to Sulfuric Acid. Pour it on cloth, paper, wood or sugar to make gunpowder.",
    acid_neutralizer: "Pour it on any acid and the acid turns into water. Baking soda, lye, ammonia and lime also neutralize acids.",
    concrete_dissolver: "A thick gel that stays on the concrete and eats down. It leaves gravel and rebar behind. Polymer and sulfur concrete resist it.",
    virus_acid: "The liquid virus. It pours and spreads very fast, but a liquid cannot climb. For climbing, use Virus Goo.",
    virus_goo: "The sticky virus. It never moves, so it climbs walls and ceilings. Walls and pipes stop it.",
    superacid: "The universal acid. Only plastic, pipes and walls stop it.",
    alien_acid: "The strongest and fastest. Even plastic and pipes dissolve.",
    boric_acid: "A powder, not a liquid. Harmless to most things.",
  };
  const GROUPS = [
    { title: "Strong real acids", intro: "Real, strong acids. Pick one for details.",
      names: ["acid", "sulfuric_acid", "nitric_acid", "hydrofluoric_acid", "aqua_regia", "fuming_hydrochloric_acid", "hydrobromic_acid", "hydroiodic_acid", "chromic_acid", "perchloric_acid", "oleum", "chlorosulfonic_acid", "triflic_acid", "red_fuming_nitric_acid", "magic_acid", "selenic_acid"] },
    { title: "Mild real acids", intro: "Real, weaker acids: cleaners, food acids and more. Pick one for details.",
      names: ["vinegar", "citric_acid", "phosphoric_acid", "glacial_acetic_acid", "carbonic_acid", "formic_acid", "lactic_acid", "oxalic_acid", "malic_acid", "tartaric_acid", "ascorbic_acid", "salicylic_acid", "boric_acid", "stomach_acid", "battery_acid", "sulfamic_acid", "hypochlorous_acid", "sulfurous_acid", "gallic_acid", "tannic_acid"] },
    { title: "Specialist acids (only eat certain things)", intro: "These only dissolve certain things. Pick one for details.",
      names: ["concrete_dissolver", "ferric_chloride", "drain_cleaner", "piranha_solution", "peracetic_acid", "carbolic_acid", "prussic_acid", "mixed_acid"] },
    { title: "Superacids (melt nearly everything)", intro: "The strongest acids. Pick one for details.",
      names: ["superacid", "superacid_concrete_safe", "alien_acid"] },
    { title: "Converter acids (turn things into other things)", intro: "Touch something and it becomes something else. Pick one for details.",
      names: ["midas_acid", "rust_acid", "petrify_acid", "ash_acid", "timber_acid", "foam_acid", "salt_acid", "sweet_acid", "dirt_acid", "sand_acid", "vapor_acid", "shock_acid", "oil_acid", "aqua_acid", "steel_acid", "plastic_acid", "brick_acid", "glass_acid", "slime_acid", "growth_acid", "magma_acid", "chaos_acid", "clone_acid", "repair_acid", "diamond_acid", "melting_acid", "cryo_acid", "silver_acid", "copper_acid", "mud_acid", "snow_acid", "shatter_acid"] },
    { title: "Purpose acids (fire, ice, plants, paint)", intro: "Acids made for a job. Pick one for details.",
      names: ["weed_killer", "fire_retardant", "deicer", "dye_red", "dye_blue", "dye_green", "dye_black", "dye_white", "acid_neutralizer"] },
    { title: "Dangerous acids (explosions, fire, spreading)", intro: "Handle with care. Pick one for details.",
      names: ["blast_acid", "hellfire_acid", "fume_acid", "red_fuming_nitric_acid", "perchloric_acid", "chromic_acid", "chlorosulfonic_acid", "melting_acid", "magma_acid", "virus_acid", "virus_goo"] },
  ];
  const START = "ACIDS 101\n\nPick an acid from the Acids tab and pour it on something. Each acid only dissolves certain things (this guide tells you which), and acids are USED UP as they dissolve things.\n\nMIXING: Nitric Acid + the game's Acid = Aqua Regia. Nitric Acid + Sulfuric Acid = Mixed Acid.\n\nFIGHTS: stronger acids eat weaker ones, equal acids destroy each other, and the viruses infect every acid (see 'Make acids fight').\n\nSTOPPING AN ACID: Acid Neutralizer, baking soda, lye, ammonia and lime turn acids into harmless stuff.\n\nSPEED: type acidPower(2) in the console to make every acid twice as fast (acidPower(0.5) for half, acidPower(1) for normal).\n\nHEAT: acids boil into gas when they get hot.\n\nTry the 'I want to...' finder if you are not sure which acid to use.";
  const GOALS = [
    { title: "Dissolve EVERYTHING", text: "Superacid melts everything except plastic, pipes and walls. Alien Acid melts even plastic and pipes, and is faster." },
    { title: "Dissolve everything EXCEPT concrete", text: "Superacid (Concrete Safe). It melts everything but concrete, reinforced concrete, rubble, cement, plastic, pipes and walls." },
    { title: "Dissolve ONLY concrete", text: "Concrete Dissolver. A thick gel that eats concrete, cement and limestone and leaves gravel and rebar behind. Polymer concrete and sulfur concrete resist it." },
    { title: "Dissolve ONLY metals", text: "Ferric Chloride, the metal etchant. It eats metals only and leaves rock, wood, flesh, glass and plastic alone. Gold resists it." },
    { title: "Dissolve ONLY organic things", text: "Drain Cleaner dissolves organic things only: wood, paper, cloth, flesh, bone, oil, wax. Piranha Solution does the same and also dissolves plastic." },
    { title: "Dissolve glass", text: "Hydrofluoric Acid. It also dissolves sand, rock, brick, ceramics, concrete, bone and flesh, but not metals or plastic." },
    { title: "Dissolve gold", text: "Aqua Regia (touch Nitric Acid to the game's Acid to make it). Superacid and Alien Acid also work. Ferric Chloride and most others do not." },
    { title: "Dissolve plastic", text: "Magic Acid is the fast one. Piranha Solution, Carbolic Acid and Glacial Acetic Acid also dissolve plastic." },
    { title: "Remove rust", text: "Ascorbic, Oxalic, Phosphoric, Citric, Sulfamic and Malic acid turn rust back into clean iron. (Rust Acid does the opposite and rusts metal.)" },
    { title: "Descale limestone", text: "Sulfamic, Citric, Malic and Lactic acid dissolve limestone and calcium. Carbonic Acid does it very slowly." },
    { title: "Kill plants, bugs or germs", text: "Weed Killer kills plants. Prussic Acid kills bugs, cells and plants. Boric Acid kills ants, termites, flies and fleas. Peracetic Acid, Carbolic Acid and Salicylic Acid kill cells and germs." },
    { title: "Put out a fire", text: "Fire Retardant puts out fire and smoke and cools magma into rock." },
    { title: "Melt ice and snow", text: "Deicer turns ice and snow into water." },
    { title: "Paint something", text: "The dye acids (red, blue, green, black, white). Each acid pixel paints one pixel." },
    { title: "Make gold", text: "Midas Acid turns metals into GOLD." },
    { title: "Make explosives", text: "Mixed Acid turns cloth, paper, wood and sugar into gunpowder. Fume Acid turns solids into explosive gas. Blast Acid makes things explode. Red Fuming Nitric Acid, Perchloric Acid and Chromic Acid make fuels and organic things explode or burn." },
    { title: "Grow things", text: "Growth Acid turns dirt and mud into grass and grass into plants. Timber Acid turns dirt, sand and ash into wood." },
    { title: "Copy or fix things", text: "Clone Acid duplicates whatever it touches. Repair Acid turns rubble back into concrete, rust into iron, ash into wood and broken glass into glass." },
    { title: "Erode things into sand or dirt", text: "Sand Acid turns rock, brick, glass and concrete into sand. Dirt Acid turns anything into dirt." },
    { title: "Climb walls with a virus", text: "Virus Goo is sticky and climbs walls and ceilings. Virus Acid is the liquid version that pours and spreads." },
    { title: "Dissolve flesh and food", text: "Stomach Acid is slow and safe for metals and rock. Glacial Acetic Acid and Lactic Acid also dissolve flesh, cheese and eggs." },
    { title: "Make acids fight", text: "Stronger acids EAT weaker acids when they touch.\nTop: Alien Acid, Superacid, Triflic, Magic Acid.\nNext: Aqua Regia, Red Fuming Nitric, Oleum, Chlorosulfonic, Fuming Hydrochloric, Perchloric, Chromic, Hydroiodic, Piranha, Hydrofluoric, Mixed, Selenic.\nThen: the game's Acid, Sulfuric, Nitric, Hydrobromic, Ferric Chloride, Drain Cleaner.\nThen most others, and weakest are the mild and food acids.\nAcids of equal strength destroy each other. The top acids also kill the viruses, and the viruses infect EVERY acid. Acid Neutralizer kills every acid." },
    { title: "Purify dirty water", text: "Hypochlorous Acid turns dirty water into clean water and kills germs." },
    { title: "Bleach or stain things", text: "Sulfurous Acid bleaches cloth, paper, wood and plants white. Tannic Acid stains wood brown. Gallic Acid turns iron and steel black. The dye acids paint anything." },
    { title: "Demolish without dissolving", text: "Shatter Acid turns glass, brick, rock and concrete into shards, rubble and gravel." },
    { title: "Make silver or copper", text: "Silver Acid turns metals into silver. Copper Acid turns metals into copper. Midas Acid turns them into gold." },
    { title: "Make acid-proof things", text: "Polymer concrete and sulfur concrete (from the concrete mod) resist all acids, including the game's own Acid. Plastic resists most acids." },
    { title: "Stop an acid", text: "Acid Neutralizer turns any acid, even the viruses, into water. Baking soda, lye, ammonia and lime also work." },
    { title: "Make new acids by mixing", text: "Nitric Acid + the game's Acid = Aqua Regia.\nNitric Acid + Sulfuric Acid = Mixed Acid." },
  ];
  function ex(n) { return elements[n] ? true : false; }
  function showText(title, text) {
    promptChoose(text, ["Back to the list", "Close"], function (c) { if (c === "Back to the list") openAcidGuide(); }, title);
  }
  function detailText(n) {
    const e = elements[n], d = (e && e.desc && e.desc !== n) ? e.desc : "";
    return nice(n) + "\n\n" + (d || EXTRA[n] || "An acid.") + (d && EXTRA[n] ? "\n\n" + EXTRA[n] : "") + "\n\nFind it in the Acids tab.";
  }
  function showGroup(g) {
    const names = g.names.filter(ex);
    promptChoose(g.intro, names.map(nice).concat(["Back to the list"]), function (choice) {
      if (choice === "Back to the list") { openAcidGuide(); return; }
      const n = names.filter(function (x) { return nice(x) === choice; })[0];
      if (!n) return;
      promptChoose(detailText(n), ["Back to " + g.title, "Back to the main list", "Close"], function (c) {
        if (c === "Back to the main list") openAcidGuide();
        else if (c === "Back to " + g.title) showGroup(g);
      }, nice(n));
    }, g.title);
  }
  function showGoals() {
    promptChoose("What do you want to do?", GOALS.map(function (g) { return g.title; }).concat(["Back to the list"]), function (choice) {
      if (choice === "Back to the list") { openAcidGuide(); return; }
      const g = GOALS.filter(function (x) { return x.title === choice; })[0];
      if (g) promptChoose(g.text, ["Back to the finder", "Back to the main list", "Close"], function (c) {
        if (c === "Back to the finder") showGoals(); else if (c === "Back to the main list") openAcidGuide();
      }, g.title);
    }, "I want to...");
  }
  function openAcidGuide() {
    if (typeof promptChoose !== "function") return;
    const titles = ["Start here", "I want to... (find the right acid)"].concat(GROUPS.map(function (g) { return g.title; }), ["Close"]);
    promptChoose("Pick a topic.", titles, function (choice) {
      if (choice === "Start here") { showText("Start here", START); return; }
      if (choice.indexOf("I want to") === 0) { showGoals(); return; }
      const g = GROUPS.filter(function (x) { return x.title === choice; })[0];
      if (g) showGroup(g);
    }, "Acid Guide");
  }
  window.acidGuide = openAcidGuide;
  elements.acid_guide = {
    color: ["#d6f5a0", "#c8ec8c"], behavior: behaviors.WALL, category: "acids", state: "solid", density: 700,
    onSelect: function () { openAcidGuide(); },
    desc: "Pick this to open the Acid Guide: what every acid does, how to make the mixed ones, and a finder for the right acid.",
  };

  ["acid", "vinegar", "acid_cloud", "acid_gas", "neutral_acid"].forEach(function (n) {   // the game's own acids move into the Acids tab
    if (elements[n] && !elements[n].hidden) elements[n].category = "acids";
  });
  console.log("realistic_acids_v10 loaded (" + (REAL_ACIDS.length + FAKE_ACIDS.length) + " acids)");
})();
