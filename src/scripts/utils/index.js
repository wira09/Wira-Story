import CONFIG from "../config";

/**
 * Format tanggal ke format yang lebih mudah dibaca
 * @param {string} date - String tanggal dari API
 * @returns {string} Tanggal yang diformat
 */
export const showFormattedDate = (date) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("id-ID", options);
};

/**
 * Helper untuk memastikan skip-to-content functionality berfungsi dengan baik
 * @returns {void}
 */
export const setupAccessibility = () => {
  // Make sure main content is focusable
  const mainContent = document.getElementById("main-content");
  if (mainContent && mainContent.getAttribute("tabindex") !== "-1") {
    mainContent.setAttribute("tabindex", "-1");
  }

  // Ensure screen readers announce when focused
  if (mainContent) {
    mainContent.addEventListener("focus", function () {
      // The aria-live attribute will make screen readers announce this
      mainContent.setAttribute("aria-live", "polite");

      // Remove the attribute after a short delay
      setTimeout(() => {
        mainContent.removeAttribute("aria-live");
      }, 1000);
    });
  }
};

/**
 * Mengecek apakah Service Worker tersedia di browser
 * @returns {boolean}
 */
export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

/**
 * Mendaftarkan Service Worker jika tersedia
 * @returns {Promise<void>}
 */
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log("Service Worker API unsupported");
    return;
  }

  try {
    // Meminta izin notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Izin notifikasi ditolak");
      return;
    }

    const registration = await navigator.serviceWorker.register(
      "/sw.bundle.js"
    );
    console.log("Service worker telah terpasang", registration);
  } catch (error) {
    console.log("Failed to install service worker:", error);
  }
}

// Simpan VAPID public key
const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

// Fungsi untuk mengkonversi VAPID key
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Fungsi untuk subscribe notifikasi
export async function subscribeNotification() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    });

    const token = localStorage.getItem('token');
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
        },
      }),
    });

    const responseJson = await response.json();
    return !responseJson.error;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return false;
  }
}

// Fungsi untuk unsubscribe notifikasi
export async function unsubscribeNotification() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${CONFIG.NOTIFICATION_ENDPOINT}/subscribe`,
        {
          method: "DELETE",
          mode: "no-cors",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        }
      );

      // Since we're using no-cors, we can't access the response JSON
      // Instead, check if the response status is ok
      const success = response.ok;
      if (success) {
        await subscription.unsubscribe();
      }
      return success;
      const responseJson = await response.json();
      await subscription.unsubscribe();
      return !responseJson.error;
    }
    return false;
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error);
    return false;
  }
}
