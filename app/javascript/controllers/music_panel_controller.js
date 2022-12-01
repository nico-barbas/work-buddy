import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="music-panel"
export default class extends Controller {
  static targets = ["input", "iframe"];

  connect() {}

  launch(event) {
    event.preventDefault();
    const url = this.inputTarget.value;
    const video_id = url.slice(url.length - 11);
    this.iframeTarget.src = `https://www.youtube.com/embed/${video_id}`;
  }
}
