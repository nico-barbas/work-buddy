import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="manage-labels"
export default class extends Controller {
  static targets = ["labelform", "creationconfirmation"]
  static values = { id: Number}

  connect() {
    "labels controller connected"
  }

  create(event) {
    event.preventDefault()
    console.log(this.labelformTarget.action)
    const url = this.labelformTarget.action
    fetch(url, {
      method: "POST",
      headers: { "Accept": "text/plain" },
      body: new FormData(this.labelformTarget)
    })
      .then(response => response.text())
      .then((data) => {
        console.log("label created")
        this.creationconfirmationTarget.classList.remove("d-none")
        // this.listTarget.outerHTML = data
        // this.labelformTarget.classList.add("d-none")
      })
  }

}
