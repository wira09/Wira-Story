import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from "../../templates";
import BookmarkPresenter from "./bookmark-presenter";
import Database from "../../data/database";
// import Map from '../../utils/map'; // Uncomment if you have a map utility

export default class BookmarkPage {
  #presenter = null;
  // #map = null; // Uncomment if you have a map utility

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>
      <section class="container">
        <h1 class="section-title">Daftar Laporan Cerita Tersimpan</h1>
        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });
    await this.#presenter.initialGalleryAndMap();
  }

  populateBookmarkedReports(message, reports) {
    if (reports.length <= 0) {
      this.populateBookmarkedReportsListEmpty();
      return;
    }
    const html = reports.reduce((accumulator, report) => {
      // Uncomment and adjust if you have a map utility
      // if (this.#map) {
      //   const coordinate = [report.lat, report.lon];
      //   const markerOptions = { alt: report.name };
      //   const popupOptions = { content: report.name };
      //   this.#map.addMarker(coordinate, markerOptions, popupOptions);
      // }
      return accumulator.concat(
        generateReportItemTemplate({
          ...report,
          placeNameLocation:
            report.lat && report.lon
              ? `${report.lat}, ${report.lon}`
              : "Lokasi tidak tersedia",
          reporterName: report.name,
        })
      );
    }, "");
    document.getElementById("reports-list").innerHTML = `
      <div class="reports-list">${html}</div>
    `;
  }

  populateBookmarkedReportsListEmpty() {
    document.getElementById("reports-list").innerHTML =
      generateReportsListEmptyTemplate();
  }

  populateBookmarkedReportsError(message) {
    document.getElementById("reports-list").innerHTML =
      generateReportsListErrorTemplate(message);
  }

  showReportsListLoading() {
    document.getElementById("reports-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideReportsListLoading() {
    document.getElementById("reports-list-loading-container").innerHTML = "";
  }

  // Uncomment if you have a map utility
  // async initialMap() {
  //   this.#map = await Map.build('#map', {
  //     zoom: 10,
  //     locate: true,
  //   });
  // }
  // showMapLoading() {
  //   document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  // }
  // hideMapLoading() {
  //   document.getElementById('map-loading-container').innerHTML = '';
  // }
}
