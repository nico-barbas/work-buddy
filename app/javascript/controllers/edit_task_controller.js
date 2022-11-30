import { Controller } from "@hotwired/stimulus"
import { csrfToken } from "@rails/ujs";


// Connects to data-controller="edit-task"
export default class extends Controller {
  static targets = ["trigger", "target", "form", "card"]

  toggleElement(event) {
    if (this.previousTarget){
      this.previousTarget.classList.toggle('hidden')
    }
    event.currentTarget.classList.toggle('hidden')
    this.element.classList.toggle('active')
    this.targetTarget.classList.toggle('hidden')
    this.previousTarget = event.currentTarget
  }

  update(event) {
    event.preventDefault()
    this.toggleElement(event)
    const url = this.formTarget.action
    fetch(url, {
      method: "PATCH",
      headers: { "Accept": "text/plain" },
      body: new FormData(this.formTarget)
    })
    .then(response => response.text())
    .then((data) => {
      this.cardTarget.outerHTML = data
      this.formTarget.classList.add("d-none")
    })
  }

  markAsDone(event) {
    event.preventDefault()
    const url = this.formTarget.action
    const postData = {
      id: event.currentTarget.id,
      task: {
        status: event.currentTarget.checked ? "done" : "to do"
      }
    }
    fetch(url, {
      method: "PATCH",
      headers: { "Accept": "text/plain",  'X-CSRF-Token': csrfToken() },
      body: JSON.stringify( postData )
    })
    .then(response => response.text())
    .then((data) => {
      this.cardTarget.outerHTML = data
      this.formTarget.classList.add("d-none")
    })
  }
}
