import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import CONFIG from "./config";

// Do precaching
const manifest = self.__WB_MANIFEST || [];
precacheAndRoute(Array.isArray(manifest) ? manifest : []);

// Runtime caching
registerRoute(
  ({ url }) => {
    return (
      url.origin === "https://fonts.googleapis.com" ||
      url.origin === "https://fonts.gstatic.com"
    );
  },
  new CacheFirst({
    cacheName: "google-fonts",
  })
);
registerRoute(
  ({ url }) => {
    return (
      url.origin === "https://cdnjs.cloudflare.com" ||
      url.origin.includes("fontawesome")
    );
  },
  new CacheFirst({
    cacheName: "fontawesome",
  })
);
registerRoute(
  ({ url }) => {
    return url.origin === "https://ui-avatars.com";
  },
  new CacheFirst({
    cacheName: "avatars-api",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "citycare-api",
  })
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "citycare-api-images",
  })
);
registerRoute(
  ({ url }) => {
    return url.origin.includes("maptiler");
  },
  new CacheFirst({
    cacheName: "maptiler-api",
  })
);

self.addEventListener("push", (event) => {
  console.log("Service Worker: Received push event");

  event.waitUntil(
    (async () => {
      let notificationData = {
        title: "Story berhasil dibuat",
        options: {
          body: "Anda telah membuat story baru",
        },
      };

      try {
        if (event.data) {
          const textData = await event.data.text();
          try {
            const parsedData = JSON.parse(textData);
            notificationData = parsedData;
          } catch (parseError) {
            // Jika gagal parse JSON, gunakan isi teks biasa sebagai body
            notificationData.options.body = textData;
          }
        }
      } catch (error) {
        console.error("Error handling push data:", error);
      }

      self.registration.showNotification(
        notificationData.title,
        notificationData.options
      );
    })()
  );
});
