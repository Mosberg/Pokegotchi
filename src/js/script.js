// script.js
// Main game logic for Pokegotchi

let pokegotchi = null;
let selectedPokemon = null;
let isShiny = false;

function populatePokemonDropdown() {
  const dropdown = document.getElementById("pokemon-dropdown");
  dropdown.innerHTML = "";
  window.POKEMON_LIST.forEach((poke, idx) => {
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = poke.name;
    dropdown.appendChild(option);
  });
}

function showPokegotchiUI(show) {
  document.getElementById("pokegotchi-ui").style.display = show ? "" : "none";
  document.getElementById("pokemon-select").style.display = show ? "none" : "";
}

function updateUI() {
  if (!pokegotchi || !selectedPokemon) return;
  document.getElementById("pokemon-name").textContent = selectedPokemon.name;
  // Types with improved coloring
  const typesDiv = document.getElementById("pokemon-types");
  typesDiv.innerHTML = selectedPokemon.types
    .map(
      (t) =>
        `<span class="type-badge" style="background:${t.color};color:#fff;padding:2px 10px;border-radius:12px;margin-right:4px;display:inline-flex;align-items:center;"><img src='${t.icon}' title='${t.name}' style='width:32px;margin-right:4px;vertical-align:middle;'>${t.name}</span>`
    )
    .join("");
  // Shiny
  document.getElementById("pokemon-img").src = isShiny
    ? selectedPokemon.shiny
    : selectedPokemon.normal;
  // Description
  document.getElementById("pokemon-description").textContent = selectedPokemon.description;
  // Stats
  document.getElementById("hunger-value").textContent = pokegotchi.hunger;
  document.getElementById("happiness-value").textContent = pokegotchi.happiness;
  document.getElementById("age-value").textContent = pokegotchi.age;
  document.getElementById("level-value").textContent = pokegotchi.level;
  // Exp bar
  const expBar = document.getElementById("exp-bar");
  if (expBar) {
    expBar.innerHTML = `EXP: ${pokegotchi.exp} / ${pokegotchi.expToNextLevel()}`;
  }
  // Evolve button
  const evolveBtn = document.getElementById("evolve-btn");
  if (selectedPokemon.evolvesTo && pokegotchi.level >= selectedPokemon.evolveLevel) {
    evolveBtn.style.display = "";
    evolveBtn.disabled = false;
    evolveBtn.textContent = `Evolve to ${getPokemonById(selectedPokemon.evolvesTo).name}`;
  } else {
    evolveBtn.style.display = "none";
  }
  // Status
  const status = document.getElementById("status-message");
  if (!pokegotchi.isAlive) {
    status.textContent = `${selectedPokemon.name} has fainted!`;
    document.getElementById("feed-btn").disabled = true;
    document.getElementById("play-btn").disabled = true;
    document.getElementById("train-btn").disabled = true;
    evolveBtn.disabled = true;
    window.showPokegotchiNotification &&
      window.showPokegotchiNotification(`${selectedPokemon.name} has fainted!`);
  } else {
    status.textContent = "";
    document.getElementById("feed-btn").disabled = false;
    document.getElementById("play-btn").disabled = false;
    document.getElementById("train-btn").disabled = false;
    evolveBtn.disabled = false;
  }
  // Achievements UI (future)
}

function getPokemonById(id) {
  return window.POKEMON_LIST.find((p) => p.id === id);
}

function startGame() {
  const idx = document.getElementById("pokemon-dropdown").value;
  selectedPokemon = window.POKEMON_LIST[idx];
  // 1/32 shiny chance
  isShiny = Math.random() < 1 / 32;
  pokegotchi = new window.Pokegotchi(selectedPokemon);
  showPokegotchiUI(true);
  pokegotchi.startLife(updateUI);
  updateUI();
}
// Shiny toggle removed

function tryEvolve() {
  if (!selectedPokemon.evolvesTo) return;
  if (pokegotchi.level < selectedPokemon.evolveLevel) return;
  selectedPokemon = getPokemonById(selectedPokemon.evolvesTo);
  pokegotchi.pokemon = selectedPokemon;
  updateUI();
  document.getElementById("status-message").textContent =
    `Your Pokémon evolved into ${selectedPokemon.name}!`;
  window.showPokegotchiNotification &&
    window.showPokegotchiNotification(`Your Pokémon evolved into ${selectedPokemon.name}!`);
}
function trainPokemon() {
  pokegotchi.train();
  updateUI();
}

function feedPokemon() {
  pokegotchi.feed();
  updateUI();
}

function playWithPokemon() {
  pokegotchi.play();
  updateUI();
}

function saveGame() {
  if (!pokegotchi || !selectedPokemon) return;
  const saveData = {
    pokemonId: selectedPokemon.id,
    hunger: pokegotchi.hunger,
    happiness: pokegotchi.happiness,
    age: pokegotchi.age,
    isAlive: pokegotchi.isAlive,
    isShiny: isShiny
  };
  localStorage.setItem("pokegotchiSave", JSON.stringify(saveData));
  document.getElementById("status-message").textContent = "Game saved!";
  window.showPokegotchiNotification && window.showPokegotchiNotification("Game saved!");
}

function loadGame() {
  const save = localStorage.getItem("pokegotchiSave");
  if (!save) return;
  const data = JSON.parse(save);
  selectedPokemon = window.POKEMON_LIST.find((p) => p.id === data.pokemonId);
  pokegotchi = new window.Pokegotchi(selectedPokemon);
  pokegotchi.hunger = data.hunger;
  pokegotchi.happiness = data.happiness;
  pokegotchi.age = data.age;
  pokegotchi.isAlive = data.isAlive;
  isShiny = !!data.isShiny;
  showPokegotchiUI(true);
  if (pokegotchi.isAlive) pokegotchi.startLife(updateUI);
  updateUI();
}

window.addEventListener("DOMContentLoaded", () => {
  populatePokemonDropdown();
  document.getElementById("choose-pokemon-btn").addEventListener("click", startGame);
  document.getElementById("feed-btn").addEventListener("click", feedPokemon);
  document.getElementById("play-btn").addEventListener("click", playWithPokemon);
  document.getElementById("save-btn").addEventListener("click", saveGame);
  document.getElementById("load-btn").addEventListener("click", loadGame);
  document.getElementById("evolve-btn").addEventListener("click", tryEvolve);
  document.getElementById("train-btn").addEventListener("click", trainPokemon);
  // Optionally, auto-load game if save exists
  if (localStorage.getItem("pokegotchiSave")) {
    loadGame();
  }
  // Settings panel logic
  const settings = window.POKEGOTCHI_SETTINGS;
  document.getElementById("setting-sound").checked = settings.sound;
  document.getElementById("setting-notifications").checked = settings.notifications;
  document.getElementById("setting-autosave").checked = settings.autosave;
  document.getElementById("setting-autosave-interval").value = settings.autosaveInterval;
  document.getElementById("setting-theme").value = settings.theme;

  document.getElementById("settings-save-btn").addEventListener("click", () => {
    const newSettings = {
      sound: document.getElementById("setting-sound").checked,
      notifications: document.getElementById("setting-notifications").checked,
      autosave: document.getElementById("setting-autosave").checked,
      autosaveInterval: parseInt(document.getElementById("setting-autosave-interval").value, 10),
      theme: document.getElementById("setting-theme").value
    };
    window.savePokegotchiSettings(newSettings);
    window.POKEGOTCHI_SETTINGS = newSettings;
    alert("Settings saved!");
    applyTheme(newSettings.theme);
  });

  function applyTheme(theme) {
    if (theme === "auto") {
      document.body.removeAttribute("data-theme");
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }
  applyTheme(settings.theme);
});
// Minigame and achievements placeholders
// function startMinigame() {}
// function unlockAchievement(name) {}
