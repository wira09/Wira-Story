import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { generateSubscribeButtonTemplate } from "../templates";
import {
  setupAccessibility,
  isServiceWorkerAvailable,
  subscribeNotification,
  unsubscribeNotification,
} from "../utils";
import NotificationInitiator from "../utils/notification-initiator";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupSkipLink();
    
    // Inisialisasi notifikasi dipindah ke sini
    if (isServiceWorkerAvailable()) {
      NotificationInitiator.init();
    }
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupSkipLink() {
    // Make sure skip link works across all pages
    document.addEventListener("click", (e) => {
      const skipLink = document.querySelector(".skip-to-content");
      if (skipLink && e.target === skipLink) {
        e.preventDefault();
        const mainContent = document.querySelector("#main-content");
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: "smooth" });

        // Set a visible focus indicator on the main content
        mainContent.classList.add("content-focused");

        // Remove the focus indicator after a delay
        setTimeout(() => {
          mainContent.classList.remove("content-focused");
        }, 2000);
      }
    });
  }

  _updateActiveNavItem() {
    const url = getActiveRoute();
    const navItems = document.querySelectorAll(".nav-list li");

    // Remove active class from all menu items
    navItems.forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to the current page's menu item
    navItems.forEach((item) => {
      const link = item.querySelector("a");
      if (link) {
        const href = link.getAttribute("href");
        const pagePath = href.replace("#", "");

        // Special case for home page
        if (
          (url === "/" && pagePath === "/") ||
          (url !== "/" && pagePath !== "/" && url.includes(pagePath))
        ) {
          item.classList.add("active");
        }
      }
    });
  }

  _stopMediaStreams() {
    // Find any active video elements and stop their streams
    document.querySelectorAll("video").forEach((video) => {
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
      }
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools"
    );
    if (!pushNotificationTools) {
      console.warn("Push notification tools element not found");
      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

    const subscribeButton = document.getElementById("subscribe-button");
    if (!subscribeButton) {
      console.warn("Subscribe button not found");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      subscribeButton.innerHTML =
        '<i class="fas fa-bell-slash"></i> Unsubscribe Notifikasi';
    }

    subscribeButton.addEventListener("click", async () => {
      try {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          const success = await unsubscribeNotification();
          if (success) {
            subscribeButton.innerHTML =
              '<i class="fas fa-bell"></i> Subscribe Notifikasi';
            alert("Berhasil berhenti berlangganan notifikasi!");
          } else {
            alert("Gagal berhenti berlangganan notifikasi!");
          }
        } else {
          const success = await subscribeNotification();
          if (success) {
            subscribeButton.innerHTML =
              '<i class="fas fa-bell-slash"></i> Unsubscribe Notifikasi';
            alert("Berhasil berlangganan notifikasi!");
          } else {
            alert("Gagal berlangganan notifikasi!");
          }
        }
      } catch (error) {
        console.error("Error handling notification subscription:", error);
        alert("Terjadi kesalahan saat mengelola langganan notifikasi!");
      }
    });
  }

  async renderPage() {
    this._stopMediaStreams();

    const url = getActiveRoute();
    const page = routes[url];

    try {
      const pageContent = await page.render();

      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          await this.#content.animate(
            { opacity: [1, 0] },
            { easing: "ease-out" }
          ).finished;

          this.#content.innerHTML = pageContent;
          await page.afterRender();
          this._updateActiveNavItem();
          this.#content.animate({ opacity: [0, 1] }, { easing: "ease-in" });
          setupAccessibility();
        });

        transition.ready.catch(console.error);
      } else {
        this.#content.style.opacity = 0;
        this.#content.innerHTML = pageContent;
        await page.afterRender();
        this._updateActiveNavItem();
        this.#content.animate({ opacity: [0, 1] }, { easing: "ease-in" });
        setupAccessibility();
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      this.#content.innerHTML = `
        <section class="container error-page" id="main-content">
          <h1>Terjadi Kesalahan</h1>
          <p class="error">Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi.</p>
          <a href="#/" class="btn-primary">Kembali ke Beranda</a>
        </section>
      `;
      setupAccessibility();
    }
  }
}

export default App;
