// src/scripts/pages/home/home-presenter.js
import { getStories } from "../../data/api";

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.stories = [];
    this._isLoading = false;
  }

  async loadStories() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.hash = "/login";
        return;
      }

      if (this._isLoading) return;
      
      this._isLoading = true;
      this.view.showLoading();

      const response = await getStories();

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.error) {
        throw new Error(response.message || "Failed to load stories");
      }

      this.stories = response.listStory || [];
      
      if (this.stories.length > 0) {
        this.view.displayStories(this.stories);
      } else {
        this.view.showEmptyState();
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      this.view.showError(error.message || "Failed to load stories. Please try again later.");
    } finally {
      this._isLoading = false;
    }
  }

  sortStoriesByDate(ascending = false) {
    try {
      if (!this.stories.length) return;

      const sortedStories = [...this.stories].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return ascending ? dateA - dateB : dateB - dateA;
      });

      this.view.displayStories(sortedStories);
    } catch (error) {
      console.error("Error sorting stories:", error);
      this.view.showError("Failed to sort stories. Please try again later.");
    }
  }
}
