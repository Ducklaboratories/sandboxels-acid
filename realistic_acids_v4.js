// realistic_acids_v4.js - Sandboxels mod: LOTS of acids, real and fake (the game only has one)
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
//  Acid Neutralizer  a base that turns any acid into water. Use it to put out the fires.
//
// Console:  acidPower(2)  doubles how fast every acid works (acidPower(0.5) halves it, acidPower(1) is normal).
// Acids are used up as they dissolve things. Bases (baking soda, lye, ammonia, lime) neutralize them.
// Load the solid concrete mod BEFORE this one if you want Concrete Dissolver to leave rebar behind.

(function () {
  // ---------------- lists of element names (names that don't exist are simply never matched) ----------------
  const GLASSY   = ["glass", "glass_shard", "rad_glass", "rad_shard", "stained_glass"];
  const PLASTICS = ["plastic", "molten_plastic", "bead"];
  const WATERS   = ["water", "salt_water", "sugar_water", "dirty_water", "pool_water"];
  const MISC     = ["fire", "smoke", "steam", "bubble", "hydrogen", "chlorine", "carbon_dioxide", "nitrogen_dioxide",
                    "earthquake", "tornado", "tsunami", "liquid_light", "sensor", "lye", "foam", "pop", "explosion"];
  const HOLDERS  = ["pipe", "pipe_wall", "wall", "rock_wall", "gate", "filter"];
  const NOBLE    = ["gold", "gold_coin", "rose_gold", "purple_gold", "blue_gold", "electrum", "diamond"];
  const CERAMICS = ["porcelain", "porcelain_shard", "baked_clay"];
  const CONCRETE = ["concrete", "reinforced_concrete", "concrete_rubble", "cement"];
  const METALS   = ["iron", "steel", "copper", "aluminum", "lead", "tin", "zinc", "silver", "nickel", "brass", "bronze", "magnesium"];
  const ORGANICS = ["wood", "paper", "cloth", "sugar", "plant", "dead_plant", "tree_branch", "grass", "meat", "cooked_meat",
                    "head", "body", "bone", "bone_marrow", "oil", "wax", "glue", "dough", "cheese", "egg", "cell", "cancer",
                    "yeast", "fiber", "sawdust", "candy", "charcoal"];
  const FUELS    = ["oil", "wax", "gasoline", "diesel", "kerosene", "alcohol", "ethanol", "propane", "methane", "glue", "rubber"];
  const REAL_ACIDS = ["sulfuric_acid", "nitric_acid", "hydrofluoric_acid", "aqua_regia", "superacid", "superacid_concrete_safe",
    "concrete_dissolver", "citric_acid", "phosphoric_acid", "glacial_acetic_acid", "carbonic_acid", "formic_acid", "perchloric_acid",
    "piranha_solution", "magic_acid", "stomach_acid", "battery_acid", "boric_acid", "hydrobromic_acid", "hydroiodic_acid", "chromic_acid",
    "red_fuming_nitric_acid", "triflic_acid", "sulfamic_acid"];
  const FAKE_ACIDS = ["alien_acid", "midas_acid", "rust_acid", "petrify_acid", "ash_acid", "melting_acid", "cryo_acid", "chaos_acid",
    "virus_acid", "acid_neutralizer"];
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
    if (Array.isArray(p)) { const k = p.filter(x => x === null || exists(x)); return k.length ? k : null; }
    return (p === null || exists(p)) ? p : null;
  }
  function reaction(elem1, elem2, chance, extra) {
    const r = {};
    if (elem1 !== undefined) r.elem1 = safeProduct(elem1);     // undefined = leave that pixel as it is
    if (elem2 !== undefined) r.elem2 = safeProduct(elem2);
    if (chance !== undefined) r.chance = chance;
    return Object.assign(r, extra || {});
  }
  function basesFor(reactions) { for (const b in BASES) reactions[b] = reaction(BASES[b].elem1, BASES[b].elem2); }

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
  let POWER = 1;
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
  }
  function applyChances(name) {
    const ra = reactAcids[name]; if (!ra) return;
    for (const k in ra.reactions) ra.reactions[k].chance = Math.min(1, ra.base[k] * POWER);
  }
  window.acidPower = function (m) {
    if (typeof m !== "number" || !(m > 0)) return "acid strength x" + POWER;
    POWER = m;
    for (const n in dbAcids) if (elements[n]) elements[n].behavior = rows(dbAcids[n].arg, dbAcids[n].power * POWER);
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
      behavior: rows(arg, opts.power),
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
  makeReactAcid("rust_acid", { color: ["#c8743a", "#bc6830", "#d4804a"], density: 1300, reactions: rustReact,
    desc: "Turns metals into RUST." });

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
  ordinary(e => e.state === "solid").forEach(n => { meltReact[n] = reaction(null, undefined, 0.5, { temp2: 250 }); });
  makeReactAcid("melting_acid", { color: ["#ff7a1a", "#ff6a0a", "#ff8a2a"], density: 1600, boil: 1500, reactions: meltReact,
    desc: "Heats whatever it touches by hundreds of degrees until it melts." });

  // ---- Cryo acid ----
  const cryoReact = {};
  ordinary(e => e.state === "solid" || e.state === "liquid").forEach(n => { cryoReact[n] = reaction(null, undefined, 0.5, { temp2: -150 }); });
  ["water", "salt_water", "dirty_water", "sugar_water", "pool_water"].forEach(n => { cryoReact[n] = reaction(null, "ice", 0.6, { temp2: -150 }); });
  makeReactAcid("cryo_acid", { color: ["#7ae8ff", "#6adcf6", "#8af0ff"], density: 1100, boil: 60, reactions: cryoReact,
    desc: "Freezes whatever it touches. Water turns to ice." });

  // ---- Chaos acid ----
  const pool = ["gold", "rust", "ice", "glass", "rock", "sand", "wood", "iron", "copper", "brick", "plastic", "dirt", "salt", "sugar",
                "ash", "gravel", "steel", "slime", "lead", "tin", "snow", "bone", "paper"].filter(exists);
  const chaosReact = {};
  ordinary(e => e.state === "solid").forEach(n => { chaosReact[n] = reaction(null, pool, 0.15); });
  makeReactAcid("chaos_acid", { color: ["#ff4ad8", "#4aff7a", "#4a7aff", "#ffe04a"], density: 1250, reactions: chaosReact,
    desc: "Turns solids into random other materials." });

  // ---- Virus acid ----
  const virusReact = {};
  ordinary(e => e.state === "solid" || e.state === "liquid").forEach(n => { virusReact[n] = reaction(undefined, "virus_acid", 0.04); });
  makeReactAcid("virus_acid", { color: ["#a8ff2a", "#7aff00", "#c4ff5a"], density: 1500, reactions: virusReact, stain: 0.2,
    desc: "Turns whatever it touches INTO MORE VIRUS ACID. It spreads! Walls and pipes stop it. Neutralizer kills it." });

  // ---- Acid neutralizer ----
  const neutReact = {};
  ACID_NAMES.concat(["virus_acid"]).filter(n => n !== "acid_neutralizer").forEach(n => { neutReact[n] = reaction(null, "water", 0.6); });
  makeReactAcid("acid_neutralizer", { color: ["#9ad0ff", "#8ec8fa", "#a6d8ff"], density: 1050, boil: 100, gas: "steam", reactions: neutReact,
    desc: "A base. Turns any acid (even Virus Acid) into water." });

  // ---------------- make the game's own acid and every acid here leave each other alone ----------------
  if (elements.acid && Array.isArray(elements.acid.ignore)) {
    ACID_NAMES.filter(n => ["acid", "neutral_acid", "acid_gas", "acid_cloud", "nitric_acid"].indexOf(n) === -1)
      .forEach(n => { if (elements.acid.ignore.indexOf(n) === -1) elements.acid.ignore.push(n); });
    if (elements.acid_gas) elements.acid_gas.ignore = elements.acid.ignore;
  }
  if (elements.acid) {                                   // the game's acid + nitric acid -> aqua regia
    elements.acid.reactions = elements.acid.reactions || {};
    elements.acid.reactions.nitric_acid = reaction("aqua_regia", "aqua_regia");
    elements.acid.reactions.acid_neutralizer = reaction(null, "water", 0.6);   // neutralizer works on the game's acid too
  }

  console.log("realistic_acids_v4 loaded (" + (REAL_ACIDS.length + FAKE_ACIDS.length) + " acids)");
})();
