import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="manage-labels"
export default class extends Controller {
  static targets = ["newlabelform", "creationconfirmation"]

  connect() {
    console.log("labels controller connected")
  }

  create(event) {
    event.preventDefault()
    console.log(this.newlabelformTarget.action)
    const url = this.newlabelformTarget.action
    fetch(url, {
      method: "POST",
      headers: { "Accept": "text/plain" },
      body: new FormData(this.newlabelformTarget)
    })
      .then(response => response.text())
      .then((data) => {
        console.log("label created")
        this.creationconfirmationTarget.classList.remove("d-none")
        event.target.reset()
      })
  }
}
