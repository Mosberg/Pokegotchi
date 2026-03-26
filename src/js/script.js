// script.js
// Main game logic for Pokegotchi

let pokegotchi = null;
let selectedPokemon = null;
let isShiny = false;
let party = [];
let achievements = [];
let currentSlot = 0;
const SAVE_SLOTS = 3;

// Autosave timer handle
let autosaveTimer = null;

// Small DOM helper
const $ = (id) => document.getElementById(id);

/* ---------- Core helpers ---------- */

function getPokemonById(id) {
  return window.POKEMON_LIST.find((p) => p.id === id) || null;
}

function showPokegotchiUI(show) {
  const displayMain = show ? "" : "none";
  const displaySelect = show ? "none" : "";
  const displayParty = show ? "" : "none";

  $("pokegotchi-ui").style.display = displayMain;
  $("pokemon-select").style.display = displaySelect;
  $("party-ui").style.display = displayParty;
}

/* ---------- Party management ---------- */

function updatePartyUI() {
  const partyList = $("party-list");
  if (!partyList) return;

  partyList.innerHTML = "";

  party.forEach((poke, idx) => {
    const div = document.createElement("div");
    div.className = "party-poke";
    div.dataset.idx = idx.toString();
    div.innerHTML = `
      <button class='remove-party-btn' title='Remove' data-idx='${idx}'>&times;</button>
      <img src='${poke.isShiny ? poke.pokemon.shiny : poke.pokemon.normal}' alt='${poke.pokemon.name}'>
      <span class='party-name'>${poke.pokemon.name}</span>
      <span class='party-level'>Lv.${poke.level}</span>
    `;
    partyList.appendChild(div);
  });
}

function addToParty(pokemon, level, shiny) {
  if (party.length >= 6) {
    window.alert("Party is full (max 6)");
    return;
  }
  party.push({ pokemon, level, isShiny: shiny });
  updatePartyUI();
}

function removeFromParty(idx) {
  if (idx < 0 || idx >= party.length) return;
  party.splice(idx, 1);
  updatePartyUI();
}

function selectPartyPokemon(idx) {
  const entry = party[idx];
  if (!entry) return;

  // Stop previous lifecycle
  if (pokegotchi) pokegotchi.stopLife();

  selectedPokemon = entry.pokemon;
  isShiny = entry.isShiny;

  pokegotchi = new window.Pokegotchi(selectedPokemon);
  pokegotchi.level = entry.level;

  showPokegotchiUI(true);
  pokegotchi.startLife(updateUI);
  updateUI();
}

/* ---------- UI update ---------- */

function updateUI() {
  if (!pokegotchi || !selectedPokemon) return;

  const hungerVal = pokegotchi.hunger;
  const happinessVal = pokegotchi.happiness;

  $("pokemon-name").textContent = selectedPokemon.name;

  // Types
  const typesDiv = $("pokemon-types");
  typesDiv.innerHTML = selectedPokemon.types
    .map(
      (t) =>
        `<span class="type-badge" style="background:${t.color};color:#fff;padding:2px 10px;border-radius:12px;margin-right:4px;display:inline-flex;align-items:center;"><img src='${t.icon}' title='${t.name}' style='width:32px;margin-right:4px;vertical-align:middle;'>${t.name}</span>`
    )
    .join("");

  // Pokémon image
  $("pokemon-img").src = isShiny ? selectedPokemon.shiny : selectedPokemon.normal;

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
  const evolveBtn = $("evolve-btn");
  const canEvolve = selectedPokemon.evolvesTo && pokegotchi.level >= selectedPokemon.evolveLevel;

  if (canEvolve) {
    const next = getPokemonById(selectedPokemon.evolvesTo);
    evolveBtn.style.display = "";
    evolveBtn.disabled = false;
    evolveBtn.textContent = `Evolve to ${next ? next.name : "?"}`;
  } else {
    evolveBtn.style.display = "none";
  }

  // Status and buttons
  const status = $("status-message");
  const feedBtn = $("feed-btn");
  const playBtn = $("play-btn");
  const trainBtn = $("train-btn");

  if (!pokegotchi.isAlive) {
    status.textContent = `${selectedPokemon.name} has fainted!`;
    feedBtn.disabled = true;
    playBtn.disabled = true;
    trainBtn.disabled = true;
    evolveBtn.disabled = true;

    if (window.showPokegotchiNotification) {
      window.showPokegotchiNotification(`${selectedPokemon.name} has fainted!`);
    }
  } else {
    status.textContent = "";
    feedBtn.disabled = false;
    playBtn.disabled = false;
    trainBtn.disabled = false;
    evolveBtn.disabled = false;
  }

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

function startGame() {
  const idx = parseInt($("pokemon-dropdown").value, 10);
  const chosen = window.POKEMON_LIST[idx];
  if (!chosen) return;

  // Stop previous lifecycle if any
  if (pokegotchi) pokegotchi.stopLife();

  selectedPokemon = chosen;
  // 1/32 shiny chance
  isShiny = Math.random() < 1 / 32;
  pokegotchi = new window.Pokegotchi(selectedPokemon);
  showPokegotchiUI(true);
  pokegotchi.startLife(updateUI);

  // Add starter to party if empty
  if (party.length === 0) {
    addToParty(selectedPokemon, pokegotchi.level, isShiny);
  }

  updateUI();
}

function newGame() {
  // Stop lifecycle
  if (pokegotchi) pokegotchi.stopLife();

  party = [];
  achievements = [];
  pokegotchi = null;
  selectedPokemon = null;
  isShiny = false;

  showPokegotchiUI(false);
  updatePartyUI();
  updateUI();

  $("status-message").textContent = "New game started!";
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

  showPokegotchiUI(true);
  if (pokegotchi.isAlive) {
    pokegotchi.startLife(updateUI);
  }
  updateUI();
  $("status-message").textContent = "Game loaded!";
}

/* ---------- Dropdowns & settings ---------- */

function populatePokemonDropdown() {
  const dropdown = $("pokemon-dropdown");
  if (!dropdown) return;

  dropdown.innerHTML = "";
  window.POKEMON_LIST.forEach((poke, idx) => {
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = poke.name;
    dropdown.appendChild(option);
  });
}

function populateSaveSlots() {
  const slotDropdown = $("save-slot-dropdown");
  if (!slotDropdown) return;

  slotDropdown.innerHTML = "";
  for (let i = 0; i < SAVE_SLOTS; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Slot ${i + 1}`;
    slotDropdown.appendChild(opt);
  }
  slotDropdown.value = String(currentSlot);

  slotDropdown.addEventListener("change", () => {
    currentSlot = parseInt(slotDropdown.value, 10) || 0;
  });
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
  const settings = window.POKEGOTCHI_SETTINGS || {};

  $("setting-sound").checked = !!settings.sound;
  $("setting-notifications").checked = !!settings.notifications;
  $("setting-autosave").checked = !!settings.autosave;
  $("setting-autosave-interval").value = settings.autosaveInterval || 30;
  $("setting-theme").value = settings.theme || "auto";

  applyTheme(settings.theme || "auto");

  $("settings-save-btn").addEventListener("click", () => {
    const newSettings = {
      sound: $("setting-sound").checked,
      notifications: $("setting-notifications").checked,
      autosave: $("setting-autosave").checked,
      autosaveInterval: parseInt($("setting-autosave-interval").value, 10) || 30,
      theme: $("setting-theme").value
    };
    window.savePokegotchiSettings(newSettings);
    window.POKEGOTCHI_SETTINGS = newSettings;
    applyTheme(newSettings.theme);
    $("status-message").textContent = "Settings saved!";
    window.alert("Settings saved!");

    setupAutosave(); // refresh autosave loop
  });
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
  populatePokemonDropdown();
  populateSaveSlots();
  initSettingsPanel();
  setupAutosave();

  // Main buttons
  $("choose-pokemon-btn").addEventListener("click", startGame);
  $("feed-btn").addEventListener("click", feedPokemon);
  $("play-btn").addEventListener("click", playWithPokemon);
  $("train-btn").addEventListener("click", trainPokemon);
  $("save-btn").addEventListener("click", saveGame);
  $("load-btn").addEventListener("click", loadGame);
  $("evolve-btn").addEventListener("click", tryEvolve);
  $("new-game-btn").addEventListener("click", newGame);

  // Party: event delegation for select/remove
  $("party-list").addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains("remove-party-btn")) {
      e.stopPropagation();
      const idx = parseInt(target.dataset.idx || "-1", 10);
      removeFromParty(idx);
      return;
    }

    const container = target.closest(".party-poke");
    if (!container) return;
    const idx = parseInt(container.dataset.idx || "-1", 10);
    if (!Number.isNaN(idx)) selectPartyPokemon(idx);
  });

  // "Add to party" button — adds current selected dropdown Pokémon (if any)
  $("add-party-btn").addEventListener("click", () => {
    const idx = parseInt($("pokemon-dropdown").value, 10);
    const poke = window.POKEMON_LIST[idx];
    if (!poke) return;
    addToParty(poke, 5, false);
  });

  // Save slot load button
  $("load-slot-btn").addEventListener("click", () => {
    loadGame();
  });

  // Auto-load if there is a save in the current slot
  if (localStorage.getItem(`pokegotchiSave${currentSlot}`)) {
    loadGame();
  } else {
    showPokegotchiUI(false);
    updatePartyUI();
  }
});
