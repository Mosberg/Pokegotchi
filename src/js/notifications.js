// notifications.js — Improved notification handler for Pokegotchi
(function () {
  const title = "Pokegotchi";

  const canNotify = () =>
    "Notification" in window &&
    Notification.permission === "granted" &&
    window.POKEGOTCHI_SETTINGS.notifications;

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  };

  function showNotification(msg) {
    const useNotifications = window.POKEGOTCHI_SETTINGS?.notifications ?? true;
    if (!useNotifications) return;

    if (canNotify()) {
      new Notification(title, { body: msg });
    } else if (Notification?.permission !== "denied") {
      requestPermission().then((granted) => {
        if (granted) new Notification(title, { body: msg });
        else showFallback(msg);
      });
    } else {
      showFallback(msg);
    }
  }

  function showFallback(msg) {
    // Non-blocking mini toast message
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.cssText =
      "position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:6px 12px;border-radius:6px;opacity:0;transition:opacity 0.5s;";
    document.body.appendChild(toast);
    requestAnimationFrame(() => (toast.style.opacity = "1"));
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  window.showPokegotchiNotification = showNotification;
})();
