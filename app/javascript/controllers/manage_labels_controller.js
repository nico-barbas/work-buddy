import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="manage-labels"
export default class extends Controller {
  static targets = ["newlabelform", "creationconfirmation", "assignlabelpartial"]

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
        // // PUSH DATA TO ASSIGN LABEL
        this.assignlabelpartialTarget.outerHTML = data
        event.target.reset()
      })
      this.creationconfirmationTarget.classList.remove("d-none")
      setTimeout(() => {
        this.creationconfirmationTarget.classList.add("d-none")
      }, 5000);
  }
}
