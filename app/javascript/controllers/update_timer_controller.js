import { Controller } from "@hotwired/stimulus";
import { csrfToken } from "@rails/ujs";

// Connects to data-controller="update-timer"
export default class extends Controller {
  static targets = ["hours", "minutes", "seconds", "play", "pause", "log"]
  static values = {id: Number}
  paused = false

  connect() {
    console.log(this.hoursTarget.innerHTML)
    console.log(this.minutesTarget.innerHTML)
    console.log(this.secondsTarget.innerHTML)
    // if @timer is not logged --> re-display the timer starting from last total_time
  }

  start(event) {
    event.preventDefault()
    this.paused = false
    const url = "/timers/create"
    fetch(url, {
      method: "POST",
      headers: { "Accept": "text/plain", 'X-CSRF-Token': csrfToken() },
      body: {}
    })
      .then(response => response.text())
      .then((data) => {
        console.log("timer created")
        setInterval(() => {
          if (this.paused) {return}
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

  pause() {
    event.preventDefault()
    this.paused = true
    const url = `/timers/${this.idValue}/pause_timer`
    fetch(url, {
      method: "PATCH",
      headers: { "Accept": "text/plain", 'X-CSRF-Token': csrfToken() },
      body: {} // CHECK COMMENT J'ENVOIE LES HOURS / MIN / SEC DANS MON TIMER CONTROLLER (avec FormDate??)
    })
      .then(response => response.text())
      .then((data) => {
        console.log("timer paused")
        let hours = parseInt(this.hoursTarget.innerHTML, 10)
        let minutes = parseInt(this.minutesTarget.innerHTML, 10)
        let seconds = parseInt(this.secondsTarget.innerHTML, 10)
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
  })
}

  // disconect() {
  //   // call pause_timer method (to make sure if there is a reload issue he does not loose everything)
  // }

  // restart() {
  //   event.preventDefault()
  // }

  // log() {

  // }


}
