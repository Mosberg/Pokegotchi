// script.js
// Main game logic for Pokegotchi with canvas-based layout

let pokegotchi = null;
let selectedPokemon = null;
let isShiny = false;
let party = [];
let achievements = [];
let currentSlot = 0;
const SAVE_SLOTS = 3;

// Autosave timer handle
let autosaveTimer = null;

// Canvas
let gameCanvas = null;
let gameCtx = null;

// Small DOM helper
const $ = (id) => document.getElementById(id);

/* ---------- Core helpers ---------- */

function getPokemonById(id) {
  return window.POKEMON_LIST.find((p) => p.id === id) || null;
}

/* ---------- Canvas drawing ---------- */

function drawPokemonOnCanvas() {
  if (!gameCanvas || !gameCtx) return;
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  if (!selectedPokemon) return;

  const img = new Image();
  img.src = isShiny ? selectedPokemon.shiny : selectedPokemon.normal;

  img.onload = () => {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    const scale = Math.min(gameCanvas.width / img.width, gameCanvas.height / img.height, 2);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = (gameCanvas.width - drawW) / 2;
    const dy = (gameCanvas.height - drawH) / 2;
    gameCtx.imageSmoothingEnabled = false;
    gameCtx.drawImage(img, dx, dy, drawW, drawH);
  };
}

/* ---------- Party management (fixed 6 slots) ---------- */

function updatePartyUI() {
  for (let i = 0; i < 6; i++) {
    const slotEl = $(`party-slot-${i + 1}`);
    if (!slotEl) continue;
    const entry = party[i];
    slotEl.innerHTML = "";

    if (!entry) {
      slotEl.textContent = `Slot ${i + 1}`;
      slotEl.style.cursor = "default";
      continue;
    }

    const img = document.createElement("img");
    img.src = entry.isShiny ? entry.pokemon.shiny : entry.pokemon.normal;
    img.alt = entry.pokemon.name;
    img.style.width = "48px";
    img.style.height = "48px";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = entry.pokemon.name;

    const lvlSpan = document.createElement("span");
    lvlSpan.textContent = `Lv.${entry.level}`;

    slotEl.appendChild(img);
    slotEl.appendChild(nameSpan);
    slotEl.appendChild(lvlSpan);
    slotEl.style.cursor = "pointer";
  }
}

function addToParty(pokemon, level, shiny) {
  if (party.length >= 6) {
    window.alert("Party is full (max 6)");
    return;
  }
  party.push({ pokemon, level, isShiny: shiny });
  updatePartyUI();
}

function removePartyMember(index) {
  if (index < 0 || index >= party.length) return;
  party.splice(index, 1);
  updatePartyUI();
}

function selectPartyPokemon(index) {
  const entry = party[index];
  if (!entry) return;

  if (pokegotchi) pokegotchi.stopLife();

  selectedPokemon = entry.pokemon;
  isShiny = entry.isShiny;
  pokegotchi = new window.Pokegotchi(selectedPokemon);
  pokegotchi.level = entry.level;

  if (pokegotchi.isAlive) {
    pokegotchi.startLife(updateUI);
  }
  updateUI();
}

/* ---------- UI update ---------- */

function updateUI() {
  if (!pokegotchi || !selectedPokemon) {
    $("pokemon-name").textContent = "No Pokémon";
    $("pokemon-description").textContent = "";
    $("hunger-value").textContent = "-";
    $("happiness-value").textContent = "-";
    $("age-value").textContent = "-";
    $("level-value").textContent = "-";
    const expBar = $("exp-bar");
    if (expBar) expBar.textContent = "";
    $("pokemon-types").innerHTML = "";
    $("status-message").textContent = "";
    drawPokemonOnCanvas();
    updatePartyUI();
    return;
  }

  const hungerVal = pokegotchi.hunger;
  const happinessVal = pokegotchi.happiness;

  $("pokemon-name").textContent = selectedPokemon.name;

  // Types
  const typesDiv = $("pokemon-types");
  typesDiv.innerHTML = selectedPokemon.types
    .map(
      (t) =>
        `<span class="type-badge" style="background:${t.color};color:#fff;padding:2px 10px;border-radius:12px;margin-right:4px;display:inline-flex;align-items:center;"><img src='${t.icon}' title='${t.name}' style='width:24px;margin-right:4px;vertical-align:middle;'>${t.name}</span>`
    )
    .join("");

  // Description
  $("pokemon-description").textContent = selectedPokemon.description;

  // Stats
  $("hunger-value").textContent = hungerVal;
  $("happiness-value").textContent = happinessVal;
  $("age-value").textContent = pokegotchi.age;
  $("level-value").textContent = pokegotchi.level;

  const expBar = $("exp-bar");
  if (expBar) {
    expBar.textContent = `EXP: ${pokegotchi.exp} / ${pokegotchi.expToNextLevel()}`;
  }

  // Evolve button
  const evolveBtn = $("evolve-button");
  const canEvolve = selectedPokemon.evolvesTo && pokegotchi.level >= selectedPokemon.evolveLevel;

  if (canEvolve) {
    const next = getPokemonById(selectedPokemon.evolvesTo);
    evolveBtn.disabled = false;
    evolveBtn.textContent = `Evolve to ${next ? next.name : "?"}`;
  } else {
    evolveBtn.disabled = true;
    evolveBtn.textContent = "Evolve";
  }

  // Status
  const status = $("status-message");
  if (!pokegotchi.isAlive) {
    status.textContent = `${selectedPokemon.name} has fainted!`;

    if (window.showPokegotchiNotification) {
      window.showPokegotchiNotification(`${selectedPokemon.name} has fainted!`);
    }
  } else {
    status.textContent = "";
  }

  drawPokemonOnCanvas();
  updatePartyUI();
}

/* ---------- Game actions ---------- */

function tryEvolve() {
  if (!pokegotchi || !selectedPokemon || !selectedPokemon.evolvesTo) return;
  if (pokegotchi.level < selectedPokemon.evolveLevel) return;

  const next = getPokemonById(selectedPokemon.evolvesTo);
  if (!next) return;

  selectedPokemon = next;
  pokegotchi.pokemon = next;
  updateUI();
  $("status-message").textContent = `Your Pokémon evolved into ${selectedPokemon.name}!`;
}

function trainPokemon() {
  if (!pokegotchi) return;
  pokegotchi.train();
  updateUI();
}

function feedPokemon() {
  if (!pokegotchi) return;
  pokegotchi.feed();
  updateUI();
}

function playWithPokemon() {
  if (!pokegotchi) return;
  pokegotchi.play();
  updateUI();
}

// Placeholder clean/sleep, ready for future logic
function cleanPokemon() {
  if (!pokegotchi) return;
  // e.g., increase happiness slightly or clear a "dirty" state
  pokegotchi.happiness = Math.min(100, pokegotchi.happiness + 5);
  updateUI();
}

function sleepPokemon() {
  if (!pokegotchi) return;
  // e.g., slowly restore happiness, reduce hunger
  pokegotchi.happiness = Math.min(100, pokegotchi.happiness + 10);
  pokegotchi.hunger = Math.min(100, pokegotchi.hunger + 5);
  updateUI();
}

/* ---------- Start / New game ---------- */

function startNewGame() {
  if (pokegotchi) pokegotchi.stopLife();

  // Simple starter picker: first Pokémon in list
  const starter = window.POKEMON_LIST[0];
  if (!starter) return;

  selectedPokemon = starter;
  isShiny = Math.random() < 1 / 32;
  pokegotchi = new window.Pokegotchi(selectedPokemon);

  // Reset party, add starter
  party = [];
  addToParty(selectedPokemon, pokegotchi.level, isShiny);

  if (pokegotchi.isAlive) {
    pokegotchi.startLife(updateUI);
  }
  updateUI();
}

/* ---------- Save / Load ---------- */

function saveGame() {
  if (!pokegotchi || !selectedPokemon) return;

  const saveData = {
    pokemonId: selectedPokemon.id,
    hunger: pokegotchi.hunger,
    happiness: pokegotchi.happiness,
    age: pokegotchi.age,
    isAlive: pokegotchi.isAlive,
    isShiny: isShiny,
    level: pokegotchi.level,
    party: party.map((p) => ({
      pokemonId: p.pokemon.id,
      level: p.level,
      isShiny: p.isShiny
    }))
  };

  try {
    localStorage.setItem(`pokegotchiSave${currentSlot}`, JSON.stringify(saveData));
    $("status-message").textContent = "Game saved!";
    if (window.showPokegotchiNotification) {
      window.showPokegotchiNotification("Game saved!");
    }
  } catch (e) {
    console.error("Failed to save game:", e);
    $("status-message").textContent = "Failed to save game (storage error).";
  }
}

function loadGame() {
  const raw = localStorage.getItem(`pokegotchiSave${currentSlot}`);
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse save:", e);
    return;
  }

  const pok = getPokemonById(data.pokemonId);
  if (!pok) return;

  if (pokegotchi) pokegotchi.stopLife();

  selectedPokemon = pok;
  pokegotchi = new window.Pokegotchi(selectedPokemon);
  pokegotchi.hunger = data.hunger;
  pokegotchi.happiness = data.happiness;
  pokegotchi.age = data.age;
  pokegotchi.isAlive = data.isAlive;
  pokegotchi.level = data.level || pokegotchi.level;
  isShiny = !!data.isShiny;

  party = (data.party || [])
    .map((p) => {
      const base = getPokemonById(p.pokemonId);
      return base
        ? {
            pokemon: base,
            level: p.level,
            isShiny: !!p.isShiny
          }
        : null;
    })
    .filter(Boolean);

  if (pokegotchi.isAlive) {
    pokegotchi.startLife(updateUI);
  }
  updateUI();
  $("status-message").textContent = "Game loaded!";
}

/* ---------- Save slots (if you want a dropdown later) ---------- */

function populateSaveSlots() {
  // You can add a dropdown for slots later; for now we keep currentSlot = 0.
}

/* ---------- Theme & settings panel ---------- */

function applyTheme(theme) {
  if (theme === "auto") {
    document.body.removeAttribute("data-theme");
  } else {
    document.body.setAttribute("data-theme", theme);
  }
}

function initSettingsPanel() {
  // Your layout example only had a "Settings" button in nav, no panel yet.
  // This function is kept minimal so you can plug a modal or side panel later.
  const settings = window.POKEGOTCHI_SETTINGS || {};
  applyTheme(settings.theme || "auto");
}

/* ---------- Autosave ---------- */

function setupAutosave() {
  const settings = window.POKEGOTCHI_SETTINGS || {};
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
  if (!settings.autosave) return;
  const intervalSec = settings.autosaveInterval || 30;
  autosaveTimer = setInterval(() => {
    if (pokegotchi && selectedPokemon) {
      saveGame();
    }
  }, intervalSec * 1000);
}

/* ---------- Initial bootstrap ---------- */

window.addEventListener("DOMContentLoaded", () => {
  gameCanvas = $("game-canvas");
  if (gameCanvas) {
    gameCtx = gameCanvas.getContext("2d");
    gameCtx.imageSmoothingEnabled = false;
  }

  populateSaveSlots();
  initSettingsPanel();
  setupAutosave();

  // Nav buttons
  $("nav-new-game").addEventListener("click", startNewGame);
  $("nav-save-game").addEventListener("click", saveGame);
  $("nav-load-game").addEventListener("click", loadGame);
  $("nav-settings").addEventListener("click", () => {
    // Hook to open settings UI when you add it
    $("status-message").textContent = "Settings button clicked.";
  });

  // Control buttons
  $("feed-button").addEventListener("click", feedPokemon);
  $("play-button").addEventListener("click", playWithPokemon);
  $("clean-button").addEventListener("click", cleanPokemon);
  $("sleep-button").addEventListener("click", sleepPokemon);
  $("train-button").addEventListener("click", trainPokemon);
  $("evolve-button").addEventListener("click", tryEvolve);

  // Party slot click selection
  for (let i = 0; i < 6; i++) {
    const slotEl = $(`party-slot-${i + 1}`);
    if (!slotEl) continue;
    slotEl.addEventListener("click", () => {
      if (i < party.length) {
        selectPartyPokemon(i);
      }
    });
  }

  // Auto-load if save exists
  if (localStorage.getItem(`pokegotchiSave${currentSlot}`)) {
    loadGame();
  } else {
    updateUI();
  }
});
