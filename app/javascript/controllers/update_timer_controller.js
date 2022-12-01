import { Controller } from "@hotwired/stimulus";
import { csrfToken } from "@rails/ujs";

// Connects to data-controller="update-timer"
export default class extends Controller {
  static targets = ["hours", "minutes", "seconds", "play", "pause", "log", "form", "total", "timerbuttons"]
  static values = {id: Number, logged: Boolean, time: Number}
  paused = false

  connect() {
    console.log("timer controller connected")
    if (this.loggedValue == false && this.timeValue != 0) {
      console.log(this.timeValue)
      console.log(this.idValue)
      console.log(this.loggedValue)
      // need to transform timeValue (milliseconds) into hours / minutes / seconds and put them into the target.innerHTML
      let milliseconds = this.timeValue
      let seconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      seconds = seconds % 60;
      minutes = seconds >= 30 ? minutes + 1 : minutes;
      minutes = minutes % 60;
      console.log(seconds)
      console.log(minutes)
      console.log(hours)
      this.display(hours, minutes, seconds)
    }
  }

  start(event) {
    event.preventDefault()
    this.paused = false
    if (this.timeValue != 0) {
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
          this.display(hours, minutes, seconds)
          this.timeValue = (hours*3600000) + (minutes*60000) + (seconds*1000)
        }, 1000);
      })
    } else {
      
    }
    this.idValue = this.idValue + 1
  }

  pause() {
    event.preventDefault()
    this.paused = true
    this.totalTarget.value = this.timeValue
    const url = this.timerUrl(this.formTarget.action)
    console.log(url)
    fetch(url, {
      method: "PATCH",
      headers: { "Accept": "text/plain", 'X-CSRF-Token': csrfToken() },
      body: new FormData(this.formTarget)
    })
      .then(response => response.text())
      .then((data) => {
        console.log("timer paused")
        let hours = parseInt(this.hoursTarget.innerHTML, 10)
        let minutes = parseInt(this.minutesTarget.innerHTML, 10)
        let seconds = parseInt(this.secondsTarget.innerHTML, 10)
        this.display(hours, minutes, seconds)
  })
}

  disconect() {
    this.paused = true
    let hours = parseInt(this.hoursTarget.innerHTML, 10) * 3600000
    let minutes = parseInt(this.minutesTarget.innerHTML, 10) * 60000
    let seconds = parseInt(this.secondsTarget.innerHTML, 10) * 1000
    this.totalTarget.value = hours + minutes + seconds
    const url = this.formTarget.action
    fetch(url, {
      method: "PATCH",
      headers: { "Accept": "text/plain" },
      body: new FormData(this.formTarget)
    })
    .then(response => response.text())
    .then((data) => {
      console.log(data)
    })
  }

  // restart() {
  //   event.preventDefault()
  // }

  // log() {

  // }

  timerUrl(url) {
    return url.replace(/\/\d+\//, `/${this.idValue}/`)
  }

  display(hours, minutes, seconds) {
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
  }

}
