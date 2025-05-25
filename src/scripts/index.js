// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import { registerServiceWorker, subscribeNotification } from "./utils";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (
    !token &&
    !window.location.hash.includes("/login") &&
    !window.location.hash.includes("/register")
  ) {
    window.location.hash = "/login";
  }

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();
  const registration = await navigator.serviceWorker.register(
    "sw.bundle.js"
  );

  // Tambahkan handler untuk tombol notifikasi
  const notificationButton = document.querySelector('#notificationButton');
  if (notificationButton) {
    notificationButton.addEventListener('click', async () => {
      try {
        const success = await subscribeNotification();
        if (success) {
          alert('Berhasil subscribe notifikasi!');
          notificationButton.textContent = 'Unsubscribe Notifikasi';
        } else {
          alert('Gagal subscribe notifikasi.');
        }
      } catch (error) {
        console.error('Error handling notification subscription:', error);
        alert('Terjadi kesalahan saat subscribe notifikasi.');
      }
    });
  }

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
