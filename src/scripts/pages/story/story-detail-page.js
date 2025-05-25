import { getStoryDetail } from "../../data/api";
import { showFormattedDate } from "../../utils";
import { parseActivePathname } from "../../routes/url-parser";
import NavigationHelper from "../../utils/navigation-helper";
import Database from "../../data/database";
import StoryDetailPresenter from "./story-detail-presenter";

export default class StoryDetailPage {
  #presenter;

  async render() {
    const { id } = parseActivePathname();
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "/login";
      return "";
    }
    const response = await getStoryDetail(id, token);
    if (response.error) {
      return `
        <section class="container" id="main-content">
          <p class="error">Error: ${response.message}</p>
          <a href="#/" class="btn-primary">Kembali ke Beranda</a>
        </section>
      `;
    }
    const story = response.story;
    return `
    <section class="story-detail" id="main-content">
      <div class="detail-header">
        <h1>${story.name}'s Story</h1>
        <div class="meta-info">
          <span class="date">${showFormattedDate(story.createdAt)}</span>
          <span class="location">
            <i class="fas fa-map-marker-alt"></i>
            ${
              story.lat && story.lon
                ? `${story.lat}, ${story.lon}`
                : "Lokasi tidak tersedia"
            }
          </span>
        </div>
      </div>
      
      <div class="content-grid">
        <div class="image-container">
          <img src="${story.photoUrl}" alt="${story.description}">
        </div>
        
        <div class="description-card">
          <h2>Story Description</h2>
          <p>${story.description}</p>
        </div>
        
        ${
          story.lat && story.lon
            ? `
        <div class="map-card">
          <h2>Story Location</h2>
          <div id="map"></div>
        </div>
        `
            : ""
        }
      </div>
      <div id="save-actions-container"></div>
    </section>
  `;
  }

  async afterRender() {
    // Menggunakan NavigationHelper untuk pengaturan navigasi
    NavigationHelper.setupAuthenticatedNavigation();

    const { id } = parseActivePathname();
    const token = localStorage.getItem("token");
    const response = await getStoryDetail(id, token);

    if (response.error) return;

    const story = response.story;

    if (story.lat && story.lon) {
      const mapElement = document.getElementById("map");
      if (mapElement) {
        try {
          const map = L.map("map").setView([story.lat, story.lon], 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`)
            .openPopup();
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }
    }

    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: { getStoryDetail },
      dbModel: Database,
    });

    // TODO: Tambahkan renderSaveButton atau renderRemoveButton sesuai status bookmark
    await this.#presenter.showSaveButton();
  }

  renderSaveButton() {
    // TODO: Tambahkan template tombol simpan
    document.getElementById("save-actions-container").innerHTML =
      '<button id="story-detail-save" class="btn btn-primary">Simpan Cerita</button>';
    document
      .getElementById("story-detail-save")
      .addEventListener("click", async () => {
        await this.#presenter.saveReport();
        await this.#presenter.showSaveButton();
      });
  }

  renderRemoveButton() {
    // TODO: Tambahkan template tombol hapus
    document.getElementById("save-actions-container").innerHTML =
      '<button id="story-detail-remove" class="btn btn-danger">Buang Cerita</button>';
    document
      .getElementById("story-detail-remove")
      .addEventListener("click", async () => {
        await this.#presenter.removeReport();
        await this.#presenter.showSaveButton();
      });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }

  removeFromBookmarkFailed(message) {
    alert(message);
  }
}
