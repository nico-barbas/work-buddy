import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="navbar"
export default class extends Controller {
  static targets = ["tasks", "timers", "music", "data"]

  connect() {
    console.log("navbar controller connected!")
  }

  displayTasks() {
    event.preventDefault()
    this.tasksTarget.classList.toggle("d-none")
  }

  displayTimers() {
    event.preventDefault()
    this.timersTarget.classList.toggle("d-none")
  }

  displayMusic() {
    event.preventDefault()
    this.musicTarget.classList.toggle("d-none")
  }

  displayData() {
    event.preventDefault()
    this.dataTarget.classList.toggle("d-none")
  }
}
