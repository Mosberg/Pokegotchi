// notifications.js
// Simple notification logic for Pokegotchi

function showNotification(msg) {
  if (!window.POKEGOTCHI_SETTINGS.notifications) return;
  if (window.Notification && Notification.permission === "granted") {
    new Notification("Pokegotchi", { body: msg });
  } else if (window.Notification && Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Pokegotchi", { body: msg });
      }
    });
  } else {
    // fallback: alert
    alert(msg);
  }
}

window.showPokegotchiNotification = showNotification;
