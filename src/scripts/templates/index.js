// templates.js
export const generateSubscribeButtonTemplate = () => `
  <button id="subscribe-button" class="btn btn-primary">
    <i class="fas fa-bell"></i><span> Subscribe Notifikasi</span>
  </button>
`;

export const generateReportItemTemplate = ({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
  placeNameLocation,
}) => `
  <div class="story-item">
    <img src="${photoUrl || ""}" 
         alt="Foto oleh ${name}: ${description}"
         loading="lazy">
    <h2>${name}</h2>
    <p>${description}</p>
    <p class="created-at"><i class="fas fa-calendar"></i> ${
      createdAt
        ? new Date(createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : ""
    }</p>
    ${
      lat && lon
        ? `<div class="mini-map" data-lat="${lat}" data-lon="${lon}"></div>`
        : ""
    }
    <a href="#/story/${id}">Lihat Detail</a>
  </div>
`;

export const generateReportsListEmptyTemplate = () => `
  <div class="reports-list-empty">Belum ada cerita tersimpan.</div>
`;

export const generateReportsListErrorTemplate = (message) => `
  <div class="reports-list-error">${message}</div>
`;

export const generateLoaderAbsoluteTemplate = () => `
  <div class="loader-absolute">Loading...</div>
`;

export const generateStoryCardTemplate = (story) => `
  <div class="story-item">
    <img src="${story.photoUrl}" 
         alt="Foto oleh ${story.name}: ${story.description}"
         loading="lazy">
    <h2>${story.name}</h2>
    <p>${story.description}</p>
    <p class="created-at"><i class="fas fa-calendar"></i> ${
      story.createdAt
        ? new Date(story.createdAt).toLocaleDateString("id-ID")
        : ""
    }</p>
    ${
      story.lat && story.lon
        ? `<div class="mini-map" data-lat="${story.lat}" data-lon="${story.lon}"></div>`
        : ""
    }
    <a href="#/story/${story.id}">Lihat Detail</a>
  </div>
`;
