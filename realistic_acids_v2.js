// realistic_acids.js - Sandboxels mod: lots of different acids (the game only has one)
//
// New category: "acids". Each acid dissolves different things, like in real life.
// (The game's own "Acid" is hydrochloric acid, and it is left exactly as it is.)
//
//   Sulfuric Acid ........ eats metals and rock, chars sugar/wood/paper/cloth into charcoal.
//                          Does NOT touch lead, gold, glass, plastic, ceramics.
//   Nitric Acid .......... eats copper, silver, zinc, brass, bronze, nickel, tin, lead, rock, flesh and gives
//                          off brown gas. Does NOT touch gold, iron, steel, aluminum (they pas­sivate), glass, plastic.
//   Hydrofluoric Acid .... the glass eater: dissolves glass, sand, rock, brick, ceramics, concrete, bone and flesh.
//                          Does NOT touch metals or plastic.
//   Aqua Regia ........... nitric + hydrochloric acid (mix them!). Dissolves gold and almost everything else.
//                          Does NOT touch glass, plastic, diamond, ceramics.
//   Superacid ............ melts EVERYTHING except plastic (like real fluoroantimonic acid, which is only
//                          kept in Teflon) and pipes/walls so you can still hold it.
//   Superacid (Concrete Safe)  same, but concrete, reinforced concrete, rubble and cement are immune.
//   Concrete Dissolver ... ONLY dissolves concrete, cement and limestone. Leaves gravel, sand and rebar behind.
//
//   MORE REAL-LIFE ACIDS (new in v2):
//   Citric Acid .......... weak. Strips rust (back to clean iron), dissolves limestone, calcium and bone slowly.
//   Phosphoric Acid ...... rust remover. Turns rust back into iron, slowly etches concrete, limestone and bone.
//   Glacial Acetic Acid .. strong vinegar. Dissolves limestone, bone, plants, flesh and plastic.
//   Carbonic Acid ........ fizzy-water / acid-rain strength. Very slowly eats limestone and concrete.
//   Formic Acid .......... ant acid. Eats iron, steel, aluminum, tin, plants and flesh. Zinc and magnesium give hydrogen.
//   Perchloric Acid ...... strong oxidizer. Eats metals and rock. Organic things it touches can EXPLODE.
//   Piranha Solution ..... dissolves everything organic (wood, paper, cloth, flesh, bone, oil, wax, plastic). Metals and glass are safe.
//   Magic Acid ........... dissolves plastic, wax, oil, glue and fuels. Named because it melts candle wax.
//   Stomach Acid ......... dissolves flesh, bone, food and plants slowly. Metals and rock are safe.
//   Battery Acid ......... zinc, magnesium and iron fizz into hydrogen gas. Lead plates survive it.
//   Boric Acid (powder) .. harmless to most things but kills ants, termites, flies and fleas.
//
// Notes: acids are used up as they dissolve things. Bases (baking soda, lye, ammonia, lime) neutralize them.
// Load the solid concrete mod BEFORE this one if you want the Concrete Dissolver to leave rebar behind.

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
  const ACID_NAMES = ["acid", "neutral_acid", "acid_gas", "acid_cloud", "sulfuric_acid", "nitric_acid",
                      "hydrofluoric_acid", "aqua_regia", "superacid", "superacid_concrete_safe", "concrete_dissolver",
                      "citric_acid", "phosphoric_acid", "glacial_acetic_acid", "carbonic_acid", "formic_acid", "perchloric_acid",
                      "piranha_solution", "magic_acid", "stomach_acid", "battery_acid", "boric_acid"];
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
  // keep only reaction products that really exist in this game
  function safeProduct(p) {
    if (Array.isArray(p)) { const k = p.filter(x => x === null || exists(x)); return k.length ? k : null; }
    return (p === null || exists(p)) ? p : null;
  }
  function reaction(elem1, elem2, chance) {
    const r = { elem1: safeProduct(elem1), elem2: safeProduct(elem2) };
    if (chance !== undefined) r.chance = chance;
    return r;
  }
  function basesFor(reactions) {
    for (const b in BASES) reactions[b] = reaction(BASES[b].elem1, BASES[b].elem2);
  }

  // ---------------- acid factory ----------------
  // opts.except = list of things it will NOT dissolve (everything else dissolves)
  // opts.only   = list of the ONLY things it dissolves
  // opts.power  = % chance per tick to dissolve a neighbour (the game's own acid is 5)
  function makeAcid(name, opts) {
    const arg = opts.only ? ":" + uniq(opts.only).join(",") : "";
    const p = opts.power, p2 = opts.power * 2;
    const el = {
      color: opts.color,
      category: "acids",
      state: "liquid",
      density: opts.density,
      behavior: [
        "XX|DB" + arg + "%" + p + "|XX",
        "DB" + arg + "%" + p + " AND M2|XX|DB" + arg + "%" + p + " AND M2",
        "DB" + arg + "%" + p + " AND M2|DB" + arg + "%" + p2 + " AND M1|DB" + arg + "%" + p + " AND M2",
      ],
      reactions: opts.reactions || {},
      tempHigh: opts.boil,
      stateHigh: exists(opts.gas || "smoke") ? (opts.gas || "smoke") : "smoke",
      stain: -0.1,
      alias: opts.alias,
      desc: opts.desc,
    };
    if (opts.except) el.ignore = uniq(opts.except);
    elements[name] = el;
  }

  // ---------------- brown gas for nitric acid ----------------
  elements.nitrogen_dioxide = {
    color: ["#b0702c", "#a0622a", "#c07c34"],
    behavior: behaviors.GAS,
    category: "gases",
    state: "gas",
    density: 1.9,
    desc: "Brown, sharp-smelling gas given off by nitric acid.",
  };

  const COMMON_SAFE = uniq([].concat(ACID_NAMES, GLASSY, PLASTICS, WATERS, MISC, HOLDERS));

  // ---------------- 1. Sulfuric acid ----------------
  const sulfReact = {};
  basesFor(sulfReact);
  sulfReact.water = reaction(null, "dirty_water", 0.2);
  ["sugar", "wood", "paper", "cloth", "plant", "dead_plant", "tree_branch", "grass"].forEach(n => {
    sulfReact[n] = reaction(null, "charcoal", 0.25);        // dehydration: organics char black
  });
  makeAcid("sulfuric_acid", {
    color: ["#ebe3a0", "#e6dc92", "#f0ebb0"], density: 1830, power: 5, boil: 337, alias: "oil of vitriol",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["lead", "sugar", "wood", "paper", "cloth", "plant", "dead_plant", "tree_branch", "grass"]),
    reactions: sulfReact,
    desc: "Eats metals and rock. Chars sugar, wood, paper and cloth to charcoal. Lead, gold, glass and plastic are safe.",
  });

  // ---------------- 2. Nitric acid ----------------
  const nitReact = {};
  basesFor(nitReact);
  nitReact.water = reaction(null, "dirty_water", 0.2);
  ["copper", "silver", "zinc", "brass", "bronze", "nickel", "tin", "lead", "magnesium"].forEach(n => {
    nitReact[n] = reaction(null, "nitrogen_dioxide", 0.2); // metal dissolves, brown gas bubbles off
  });
  nitReact.acid = reaction("aqua_regia", "aqua_regia");    // nitric + hydrochloric = aqua regia
  makeAcid("nitric_acid", {
    color: ["#f2cf5a", "#ecc44c", "#f7d96a"], density: 1510, power: 6, boil: 83, gas: "nitrogen_dioxide", alias: "aqua fortis",
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["iron", "steel", "aluminum", "tungsten"],
                               ["copper", "silver", "zinc", "brass", "bronze", "nickel", "tin", "lead", "magnesium"]),
    reactions: nitReact,
    desc: "Eats copper, silver, zinc and more, with brown gas. Gold, iron, steel and aluminum resist it. Mix with Acid to make Aqua Regia.",
  });

  // ---------------- 3. Hydrofluoric acid ----------------
  const hfReact = {};
  basesFor(hfReact);
  hfReact.water = reaction(null, "dirty_water", 0.2);
  makeAcid("hydrofluoric_acid", {
    color: ["#b4e0ee", "#a6d8e8", "#c0e8f4"], density: 1150, power: 6, boil: 105,
    only: [].concat(GLASSY, CERAMICS, CONCRETE,
      ["sand", "rock", "gravel", "mudstone", "sandstone", "brick", "brick_rubble", "clay", "clay_shard", "limestone",
       "bone", "bone_marrow", "head", "body", "meat"]),
    reactions: hfReact,
    desc: "The glass eater. Dissolves glass, sand, rock, brick, ceramics, concrete, bone and flesh. Metals and plastic are safe.",
  });

  // ---------------- 4. Aqua regia ----------------
  const arReact = {};
  basesFor(arReact);
  arReact.water = reaction(null, "dirty_water", 0.2);
  makeAcid("aqua_regia", {
    color: ["#ee9a2a", "#e48c22", "#f4a63a"], density: 1200, power: 8, boil: 100, alias: "royal water",
    except: COMMON_SAFE.concat(["diamond"], CERAMICS),
    reactions: arReact,
    desc: "Nitric + hydrochloric acid. Dissolves gold and nearly everything else. Glass, plastic, diamond and ceramics resist it.",
  });

  // ---------------- 5. Superacid (melts everything but plastic) ----------------
  makeAcid("superacid", {
    color: ["#c9a0ff", "#bb8cff", "#d8b4ff"], density: 2880, power: 20, boil: 150, alias: "fluoroantimonic acid",
    except: [].concat(ACID_NAMES, PLASTICS, MISC, HOLDERS),
    desc: "Melts EVERYTHING except plastic, pipes and walls. Very fast.",
  });

  // ---------------- 6. Superacid, concrete safe ----------------
  makeAcid("superacid_concrete_safe", {
    color: ["#9effd4", "#8cf5c6", "#b0ffe0"], density: 2880, power: 20, boil: 150,
    except: [].concat(ACID_NAMES, PLASTICS, MISC, HOLDERS, CONCRETE),
    desc: "Melts everything EXCEPT concrete, reinforced concrete, rubble, cement, plastic, pipes and walls.",
  });

  // ---------------- 7. Concrete dissolver (reactions only: it dissolves nothing else) ----------------
  const cdReact = {};
  basesFor(cdReact);
  const rebarOrGravel = exists("rebar") ? "rebar" : "gravel";
  cdReact.concrete             = reaction(null, ["gravel", "sand", "gravel"], 0.3);   // cement paste dissolves, stones are left
  cdReact.reinforced_concrete  = reaction(null, [rebarOrGravel, "gravel"], 0.3);      // steel bars are left
  cdReact.concrete_rubble      = reaction(null, ["gravel", "sand"], 0.4);
  cdReact.cement               = reaction(null, null, 0.4);
  cdReact.limestone            = reaction(null, ["carbon_dioxide", "gravel"], 0.3);
  elements.concrete_dissolver = {
    color: ["#f4a0b4", "#ee94a8", "#f8b0c0"],
    behavior: behaviors.LIQUID,
    reactions: cdReact,
    category: "acids",
    state: "liquid",
    density: 1100,
    tempHigh: 105,
    stateHigh: "smoke",
    stain: -0.05,
    alias: "concrete remover",
    desc: "Only dissolves concrete, cement and limestone. Leaves the gravel, sand and steel bars behind.",
  };

  // ======================= MORE REAL-LIFE ACIDS (v2) =======================
  const ORGANICS = ["wood", "paper", "cloth", "sugar", "plant", "dead_plant", "tree_branch", "grass", "meat", "cooked_meat",
                    "head", "body", "bone", "bone_marrow", "oil", "wax", "glue", "dough", "cheese", "egg", "cell", "cancer",
                    "yeast", "fiber", "sawdust", "candy", "charcoal"];
  const FUELS = ["oil", "wax", "gasoline", "diesel", "kerosene", "alcohol", "ethanol", "propane", "methane", "glue", "rubber"];
  const rustToIron = () => reaction(null, "iron", 0.3);        // derusting leaves clean metal

  // ---- Citric acid ----
  const citReact = {}; basesFor(citReact); citReact.water = reaction(null, "dirty_water", 0.1); citReact.rust = rustToIron();
  makeAcid("citric_acid", {
    color: ["#f2ee9c", "#ece890", "#f6f2a8"], density: 1100, power: 1.5, boil: 100,
    only: ["limestone", "calcium", "bone", "bone_marrow", "mudstone", "slaked_lime", "quicklime"],
    reactions: citReact,
    desc: "Weak. Strips rust back to clean iron and slowly dissolves limestone, calcium and bone.",
  });

  // ---- Phosphoric acid (rust remover) ----
  const phosReact = {}; basesFor(phosReact); phosReact.water = reaction(null, "dirty_water", 0.1); phosReact.rust = rustToIron();
  makeAcid("phosphoric_acid", {
    color: ["#d6e4ea", "#cddde4", "#dfecf0"], density: 1685, power: 2, boil: 158,
    only: [].concat(CONCRETE, ["limestone", "calcium", "bone", "bone_marrow"]),
    reactions: phosReact,
    desc: "Rust remover. Turns rust back into iron and slowly etches concrete, limestone and bone.",
  });

  // ---- Glacial acetic acid ----
  const gaaReact = {}; basesFor(gaaReact); gaaReact.water = reaction(null, "dirty_water", 0.15);
  makeAcid("glacial_acetic_acid", {
    color: ["#e6f0ec", "#dde9e4", "#eef6f2"], density: 1049, power: 3, boil: 118, alias: "pure vinegar",
    only: ["limestone", "calcium", "bone", "bone_marrow", "plant", "dead_plant", "tree_branch", "grass", "meat", "cooked_meat",
           "head", "body", "paper", "cloth", "plastic", "molten_plastic"],
    reactions: gaaReact,
    desc: "Strong vinegar. Dissolves limestone, bone, plants, flesh, paper and plastic.",
  });

  // ---- Carbonic acid ----
  const carbReact = {}; basesFor(carbReact);
  makeAcid("carbonic_acid", {
    color: ["#c8e0f4", "#bcd8f0", "#d2e8f8"], density: 1000, power: 0.6, boil: 100, gas: "carbon_dioxide", alias: "soda water",
    only: [].concat(CONCRETE, ["limestone", "calcium", "mudstone"]),
    reactions: carbReact,
    desc: "Fizzy-water / acid-rain strength. Very slowly eats limestone and concrete.",
  });

  // ---- Formic acid ----
  const formReact = {}; basesFor(formReact); formReact.water = reaction(null, "dirty_water", 0.15);
  formReact.zinc = reaction("hydrogen", null, 0.05);
  formReact.magnesium = reaction("hydrogen", null, 0.05);
  makeAcid("formic_acid", {
    color: ["#ece0c4", "#e6d8b8", "#f2e8d0"], density: 1220, power: 4, boil: 101, alias: "ant acid",
    only: ["iron", "steel", "aluminum", "tin", "calcium", "limestone", "plant", "dead_plant", "tree_branch", "grass",
           "meat", "cooked_meat", "head", "body", "bone"],
    reactions: formReact,
    desc: "Ant acid. Eats iron, steel, aluminum, tin, plants and flesh. Zinc and magnesium give off hydrogen.",
  });

  // ---- Perchloric acid (strong oxidizer: organics can explode) ----
  const percReact = {}; basesFor(percReact); percReact.water = reaction(null, "dirty_water", 0.2);
  ["wood", "paper", "cloth", "sugar", "plant", "dead_plant", "tree_branch", "grass", "oil", "alcohol", "wax", "charcoal", "sawdust", "gunpowder"]
    .forEach(n => { percReact[n] = reaction("explosion", "fire", 0.05); });
  makeAcid("perchloric_acid", {
    color: ["#d8d8ea", "#cecee2", "#e2e2f2"], density: 1664, power: 7, boil: 203,
    except: COMMON_SAFE.concat(NOBLE, CERAMICS, ["wood", "paper", "cloth", "sugar", "plant", "dead_plant", "tree_branch", "grass",
                                                 "oil", "alcohol", "wax", "charcoal", "sawdust", "gunpowder"]),
    reactions: percReact,
    desc: "Strong oxidizer. Eats metals and rock. Wood, paper, cloth, sugar, oil and other organic things can EXPLODE on contact.",
  });

  // ---- Piranha solution (organics only) ----
  const piranhaReact = {}; basesFor(piranhaReact); piranhaReact.water = reaction(null, "dirty_water", 0.3);
  makeAcid("piranha_solution", {
    color: ["#b8a0e8", "#ac94e0", "#c4acf0"], density: 1700, power: 8, boil: 150,
    only: ORGANICS.concat(["plastic", "molten_plastic"]),
    reactions: piranhaReact,
    desc: "Dissolves everything organic: wood, paper, cloth, flesh, bone, oil, wax and plastic. Metals, glass and rock are safe.",
  });

  // ---- Magic acid (superacid for fuels and plastics) ----
  makeAcid("magic_acid", {
    color: ["#e48ad8", "#dc7ed0", "#ec98e2"], density: 1740, power: 12, boil: 120,
    only: FUELS.concat(["plastic", "molten_plastic", "paper", "cloth", "wood", "plant", "dead_plant", "tree_branch", "grass", "charcoal"]),
    desc: "Named because it melts candle wax. Dissolves plastic, wax, oil, glue and fuels fast. Metals, rock and glass are safe.",
  });

  // ---- Stomach acid ----
  const stomReact = {}; basesFor(stomReact); stomReact.water = reaction(null, "dirty_water", 0.1);
  makeAcid("stomach_acid", {
    color: ["#dcdc88", "#d2d27c", "#e4e494"], density: 1010, power: 3, boil: 100,
    only: ["meat", "cooked_meat", "bone", "bone_marrow", "head", "body", "plant", "dead_plant", "grass", "egg", "cheese",
           "dough", "candy", "sugar", "fiber", "cell"],
    reactions: stomReact,
    desc: "Dissolves flesh, bone, food and plants slowly. Metals, rock and glass are safe.",
  });

  // ---- Battery acid (reactions only) ----
  const batReact = {}; basesFor(batReact); batReact.water = reaction(null, "dirty_water", 0.1);
  batReact.zinc      = reaction("hydrogen", null, 0.06);
  batReact.magnesium = reaction("hydrogen", null, 0.06);
  batReact.iron      = reaction("hydrogen", null, 0.02);
  batReact.steel     = reaction("hydrogen", null, 0.015);
  elements.battery_acid = {
    color: ["#d6d2a4", "#cecc9a", "#dedaae"],
    behavior: behaviors.LIQUID,
    reactions: batReact,
    category: "acids",
    state: "liquid",
    density: 1280,
    tempHigh: 108,
    stateHigh: "smoke",
    stain: -0.1,
    desc: "Zinc, magnesium and iron fizz into hydrogen gas. Lead plates survive it.",
  };

  // ---- Boric acid (a powder that kills bugs) ----
  const boricReact = {};
  ["ant", "termite", "fly", "flea"].forEach(n => { boricReact[n] = reaction(null, "dead_bug", 0.1); });
  elements.boric_acid = {
    color: ["#f6f6f2", "#eeeee8", "#fafaf6"],
    behavior: behaviors.POWDER,
    reactions: boricReact,
    category: "acids",
    state: "solid",
    density: 1435,
    tempHigh: 170,
    stateHigh: "steam",
    desc: "A mild acid powder. Harmless to most things, but kills ants, termites, flies and fleas.",
  };

  // ---------------- make the game's own acids leave ours alone ----------------
  if (elements.acid && Array.isArray(elements.acid.ignore)) {
    ACID_NAMES.filter(n => ["acid", "neutral_acid", "acid_gas", "acid_cloud"].indexOf(n) === -1)
      .forEach(n => { if (elements.acid.ignore.indexOf(n) === -1) elements.acid.ignore.push(n); });
    // exception: nitric acid must be able to meet hydrochloric acid to make aqua regia
    elements.acid.ignore = elements.acid.ignore.filter(n => n !== "nitric_acid");
    if (elements.acid_gas) elements.acid_gas.ignore = elements.acid.ignore;
  }
  // the game's own acid + nitric acid -> aqua regia (works from either side)
  if (elements.acid) {
    elements.acid.reactions = elements.acid.reactions || {};
    elements.acid.reactions.nitric_acid = reaction("aqua_regia", "aqua_regia");
  }

  console.log("realistic_acids_v2 loaded");
})();
