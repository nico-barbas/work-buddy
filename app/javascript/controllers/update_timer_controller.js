import { Controller } from "@hotwired/stimulus";
import { csrfToken } from "@rails/ujs";
import { SignalDispatcher } from "./game/signal";

// Connects to data-controller="update-timer"
export default class extends Controller {
  static targets = [
    "hours",
    "minutes",
    "seconds",
    "play",
    "pause",
    "log",
    "form",
    "total",
    "logform",
    "logtotal",
    "logconfirmation",
  ];
  static values = { id: Number, logged: Boolean, time: Number };
  paused = false;

  connect() {
    addEventListener("beforeunload", (event) => {
      this.paused = true;
      this.totalTarget.value = this.timeValue;
      const url = this.timerUrl(this.formTarget.action);
      fetch(url, {
        method: "PATCH",
        headers: { Accept: "text/plain", "X-CSRF-Token": csrfToken() },
        body: new FormData(this.formTarget),
      })
        .then((response) => response.text())
        .then((data) => {
          console.log(data);
        });
    });

    console.log("timer controller connected");
    this.paused = true;
    if (this.loggedValue == false && this.timeValue != 0) {
      console.log(this.timeValue);
      console.log(this.idValue);
      console.log(this.loggedValue);
      // need to transform timeValue (milliseconds) into hours / minutes / seconds and put them into the target.innerHTML
      let milliseconds = this.timeValue;
      let seconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      seconds = seconds % 60;
      minutes = seconds >= 30 ? minutes + 1 : minutes;
      minutes = minutes % 60;
      console.log(seconds);
      console.log(minutes);
      console.log(hours);
      this.display(hours, minutes, seconds);
    }
    setInterval(() => {
      if (this.paused) {
        return;
      }
      let hours = parseInt(this.hoursTarget.innerHTML, 10);
      let minutes = parseInt(this.minutesTarget.innerHTML, 10);
      let seconds = parseInt(this.secondsTarget.innerHTML, 10);
      if (seconds + 1 >= 60) {
        seconds = 0;
        if (minutes + 1 >= 60) {
          minutes = 0;
          hours += 1;
        } else {
          minutes += 1;
        }
      } else {
        seconds += 1;
      }
      this.display(hours, minutes, seconds);
      this.timeValue = hours * 3600000 + minutes * 60000 + seconds * 1000;
    }, 1000);
  }

  start(event) {
    event.preventDefault();
    this.logconfirmationTarget.innerHTML = "";
    this.paused = false;
    console.log(this.timeValue);
    console.log(this.loggedValue);
    if (this.loggedValue == false && this.timeValue != 0) {
      // on restart le timer
      console.log("timer restarted");
    } else {
      this.loggedValue = false;
      const url = "/timers/create";
      fetch(url, {
        method: "POST",
        headers: { Accept: "text/plain", "X-CSRF-Token": csrfToken() },
        body: {},
      })
        .then((response) => response.text())
        .then((data) => {
          console.log("timer created");
        });
      this.idValue = this.idValue + 1;
    }
    SignalDispatcher.dispatchSignal("interrupt.work");
    // NEED TO DISABLE THE PLAY BUTTON UNTIL THE PAUSE BUTTON IS CLICKED
  }

  pause(event) {
    event.preventDefault();
    this.paused = true;
    this.totalTarget.value = this.timeValue;
    const url = this.timerUrl(this.formTarget.action);
    fetch(url, {
      method: "PATCH",
      headers: { Accept: "text/plain", "X-CSRF-Token": csrfToken() },
      body: new FormData(this.formTarget),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("timer paused");
        let hours = parseInt(this.hoursTarget.innerHTML, 10);
        let minutes = parseInt(this.minutesTarget.innerHTML, 10);
        let seconds = parseInt(this.secondsTarget.innerHTML, 10);
        this.display(hours, minutes, seconds);
      });
    SignalDispatcher.dispatchSignal("interrupt.break");
    // NEED TO DISABLE THE PAUSE BUTTON UNTIL THE START BUTTON IS CLICKED AGAIN, OTHERWISE IT CREATE ISSUES
  }

  log(event) {
    event.preventDefault();
    this.paused = true;
    this.logtotalTarget.value = this.timeValue;
    const url = this.timerUrl(this.logformTarget.action);
    fetch(url, {
      method: "PATCH",
      headers: { Accept: "text/plain", "X-CSRF-Token": csrfToken() },
      body: new FormData(this.logformTarget),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("timer logged");
        this.loggedValue = true;
        this.hoursTarget.innerHTML = "00";
        this.minutesTarget.innerHTML = "00";
        this.secondsTarget.innerHTML = "00";
        this.logconfirmationTarget.innerHTML =
          "Your last timer has been logged!<br>You can create a new one.";
      });
    SignalDispatcher.dispatchSignal("interrupt.break");
    SignalDispatcher.dispatchSignal("interrupt.celebrate");
  }

  timerUrl(url) {
    return url.replace(/\/\d+\//, `/${this.idValue}/`);
  }

  display(hours, minutes, seconds) {
    if (hours < 10) {
      this.hoursTarget.innerHTML = `0${hours}`;
    } else {
      this.hoursTarget.innerHTML = hours;
    }
    if (minutes < 10) {
      this.minutesTarget.innerHTML = `0${minutes}`;
    } else {
      this.minutesTarget.innerHTML = minutes;
    }
    if (seconds < 10) {
      this.secondsTarget.innerHTML = `0${seconds}`;
    } else {
      this.secondsTarget.innerHTML = seconds;
    }
  }

  disconnect() {
    this.paused = true;
    this.totalTarget.value = this.timeValue;
    const url = this.timerUrl(this.formTarget.action);
    fetch(url, {
      method: "PATCH",
      headers: { Accept: "text/plain", "X-CSRF-Token": csrfToken() },
      body: new FormData(this.formTarget),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
      });
  }
}
