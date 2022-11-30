import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="edit-task"
export default class extends Controller {
  static targets = ["trigger", "target", "form", "card"]

  static values = {
    id: Number
  }

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
    console.log(this.formTarget)
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
    console.log('hello')
    this.cardTarget.outerHTML = data
    this.formTarget.classList.add("d-none")
  })
}

}
