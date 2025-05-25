import Database from "../../data/database";

export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #dbModel;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async saveReport() {
    try {
      const token = localStorage.getItem("token");
      const response = await this.#apiModel.getStoryDetail(
        this.#storyId,
        token
      );
      if (response.error) throw new Error(response.message);
      const story = response.story;
      // Pastikan field yang disimpan lengkap sesuai card
      const reportToSave = {
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl || story.photo || "",
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon,
      };
      await this.#dbModel.putReport(reportToSave);
      this.#view.saveToBookmarkSuccessfully("Success to save to bookmark");
    } catch (error) {
      console.error("saveReport: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeReport() {
    try {
      await this.#dbModel.removeReport(this.#storyId);
      this.#view.removeFromBookmarkSuccessfully(
        "Success to remove from bookmark"
      );
    } catch (error) {
      console.error("removeReport: error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }
    this.#view.renderSaveButton();
  }

  async #isReportSaved() {
    return !!(await this.#dbModel.getReportById(this.#storyId));
  }
}
