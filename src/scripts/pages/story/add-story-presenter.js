import { addStory } from "../../data/api";

export default class AddStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async initCamera() {
    try {
      const constraints = {
        video: {
          facingMode: "environment", // Use back camera on mobile by default
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.view.showCameraPreview(stream);
    } catch (error) {
      console.error("Camera access error:", error);
      this.view.showError(
        "Tidak dapat mengakses kamera. Silakan gunakan opsi upload file."
      );
    }
  }

  async capturePhoto(videoElement) {
    if (!videoElement) return null;

    const canvas = document.createElement("canvas");
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(videoElement, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9); // Higher quality for captured images
    });
  }

  async submitStory(data) {
    try {
      this._validateStoryData(data);

      const response = await addStory(data);

      if (!response.error) {
        this.view.redirectToHome();
      } else {
        this.view.showError(response.message || "Gagal mengunggah story");
      }
    } catch (error) {
      this.view.showError(error.message || "Gagal mengunggah story");
    }
  }

  _validateStoryData(data) {
    if (!data.description) throw new Error("Deskripsi wajib diisi");
    if (!data.photo) throw new Error("Foto wajib diisi");

    // Optional location validation
    if ((data.lat && !data.lon) || (!data.lat && data.lon)) {
      throw new Error("Koordinat lokasi tidak lengkap");
    }
  }
}
