import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="create-task"
export default class extends Controller {
  static targets = ["form", "list"]

  displayForm() {
    this.formTarget.classList.remove("d-none")
  }

  create(event) {
    event.preventDefault()
    const url = this.formTarget.action
    fetch(url, {
      method: "POST",
      headers: { "Accept": "text/plain" },
      body: new FormData(this.formTarget)
    })
      .then(response => response.text())
      .then((data) => {
        this.listTarget.outerHTML = data
        this.formTarget.classList.add("d-none")

      })
  }
}
