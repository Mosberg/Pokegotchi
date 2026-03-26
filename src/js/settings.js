// settings.js
// User settings and config for Pokegotchi

const DEFAULT_SETTINGS = {
  sound: true,
  notifications: true,
  autosave: true,
  autosaveInterval: 30, // seconds
  theme: "auto" // 'auto', 'light', 'dark'
};

function loadSettings() {
  const s = localStorage.getItem("pokegotchiSettings");
  if (!s) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem("pokegotchiSettings", JSON.stringify(settings));
}

window.POKEGOTCHI_SETTINGS = loadSettings();
window.savePokegotchiSettings = saveSettings;
