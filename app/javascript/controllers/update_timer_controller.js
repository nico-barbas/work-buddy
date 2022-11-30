import { Controller } from "@hotwired/stimulus";
import { csrfToken } from "@rails/ujs";

// Connects to data-controller="update-timer"
export default class extends Controller {
  static targets = ["hours", "minutes", "seconds", "play"]
  static values = {id: Number}

  connect() {
    console.log(this.hoursTarget.innerHTML)
    console.log(this.minutesTarget.innerHTML)
    console.log(this.secondsTarget.innerHTML)
  }

  start(event) {
    event.preventDefault()
    const url = "/timers/create"
    fetch(url, {
      method: "POST",
      headers: { "Accept": "text/plain", 'X-CSRF-Token': csrfToken() },
      body: new FormData(this.formTarget)
    })
      .then(response => response.text())
      .then((data) => {
        console.log("timer created")
        setInterval(() => {
          let hours = parseInt(this.hoursTarget.innerHTML, 10)
          let minutes = parseInt(this.minutesTarget.innerHTML, 10)
          let seconds = parseInt(this.secondsTarget.innerHTML, 10)
          if ((seconds + 1) >= 60) {
            seconds = 0
            if ((minutes + 1) >= 60) {
              minutes = 0
              hours +=1
            } else {
              minutes += 1
            }
          } else {
            seconds += 1
          }
          if (hours < 10) {
            this.hoursTarget.innerHTML = `0${hours}`
          } else {
            this.hoursTarget.innerHTML = hours
          }
          if (minutes < 10) {
            this.minutesTarget.innerHTML = `0${minutes}`
          } else {
            this.minutesTarget.innerHTML = minutes
          }
          if (seconds < 10) {
            this.secondsTarget.innerHTML = `0${seconds}`
          } else {
            this.secondsTarget.innerHTML = seconds
          }
        }, 1000);
      })
  }

}
