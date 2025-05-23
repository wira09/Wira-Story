// src/scripts/pages/home/home-page.js
import HomePresenter from "./home-presenter";
import NavigationHelper from "../../utils/navigation-helper";

class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this._initialSetup();
  }

  _initialSetup() {
    // Initialize any required properties
    this.container = null;
    this.storyListContainer = null;
  }

  async render() {
    const userName = localStorage.getItem("userName");

    return `
      <section class="container" id="main-content">
        <div class="welcome-user">
          <h2 class="welcome-heading">Selamat datang, ${userName || "User"}</h2>
          <p class="welcome-subheading">
            Temukan cerita-cerita menarik dan berbagi pengalaman Anda!
          </p>
        </div>
        <div id="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    // Cache DOM elements
    this.container = document.getElementById("main-content");
    this.storyListContainer = document.getElementById("story-list");

    // Setup navigation
    NavigationHelper.setupAuthenticatedNavigation();

    // Load stories
    await this.presenter.loadStories();
  }

  displayStories(stories) {
    if (!this.storyListContainer) return;

    if (!stories.length) {
      this.showEmptyState();
      return;
    }

    this.storyListContainer.innerHTML = stories
      .map(
        (story) => `
      <div class="story-item">
        <img src="${story.photoUrl}" 
             alt="Foto oleh ${story.name}: ${story.description}"
             loading="lazy">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <p class="created-at"><i class="fas fa-calendar"></i> ${this.formatDate(
          story.createdAt
        )}</p>
        ${story.lat && story.lon
          ? `<div class="mini-map" 
                   data-lat="${story.lat}" 
                   data-lon="${story.lon}"></div>`
          : ""}
        <a href="#/story/${story.id}">Lihat Detail</a>
      </div>
    `
      )
      .join("");

    // Initialize maps after DOM update
    requestAnimationFrame(() => this.initMiniMaps());
  }

  showEmptyState() {
    if (!this.storyListContainer) return;

    this.storyListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-scroll fa-3x"></i>
        <h3>Belum ada story</h3>
        <p>Jadilah yang pertama menambahkan story!</p>
        <a href="#/add-story" class="btn-primary">
          <i class="fas fa-plus"></i> Tambah Story Baru
        </a>
      </div>
    `;
  }

  showLoading() {
    if (!this.storyListContainer) return;
    
    this.storyListContainer.innerHTML = '<div class="loading">Loading stories...</div>';
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  initMiniMaps() {
    if (!this.storyListContainer) return;

    const mapElements = this.storyListContainer.querySelectorAll(".mini-map");
    
    mapElements.forEach((mapEl) => {
      const lat = parseFloat(mapEl.dataset.lat);
      const lon = parseFloat(mapEl.dataset.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        try {
          const miniMap = L.map(mapEl, {
            zoomControl: false,
            attributionControl: false,
          }).setView([lat, lon], 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 16,
            minZoom: 10,
          }).addTo(miniMap);

          L.marker([lat, lon]).addTo(miniMap);

          mapEl.style.height = "150px";
          mapEl.style.borderRadius = "8px";
          mapEl.style.marginTop = "10px";

          miniMap.invalidateSize();
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    });
  }

  showError(message) {
    if (!this.storyListContainer) return;

    this.storyListContainer.innerHTML = `<p class="error">⛔ ${message}</p>`;
  }
}

export default HomePage;
