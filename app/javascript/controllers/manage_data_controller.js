import { Controller } from "@hotwired/stimulus";
import { csrfToken } from "@rails/ujs";
import { SignalDispatcher } from "./game/signal";

// Connects to data-controller="manage-data"
export default class extends Controller {
  static targets = ["dailytotal", "labeltimes"];
  connect() {
    console.log("data controller connected");
  }

  displayData() {
    event.preventDefault();
    this.labeltimesTarget.innerHTML = "";
    const url = `/users/get_daily_times`;
    fetch(url, {
      method: "get",
      headers: { Accept: "application/json", "X-CSRF-Token": csrfToken() },
    })
      .then((response) => response.json())
      .then((data) => {
        let daily_total_time = `${data.daily_hours} hours ${data.daily_minutes} minutes`;
        this.dailytotalTarget.innerHTML = daily_total_time;
        let labels = data.labels;
        labels.forEach((label) => {
          let totalmilliseconds = label.total_label_time;
          let totalseconds = Math.floor(totalmilliseconds / 1000);
          let totalminutes = Math.floor(totalseconds / 60);
          let totalhours = Math.floor(totalminutes / 60);
          totalseconds = totalseconds % 60;
          totalminutes = totalseconds >= 60 ? totalminutes + 1 : totalminutes;
          totalminutes = totalminutes % 60;
          if (totalminutes < 10) {
            totalminutes = `0${totalminutes}`;
          }
          let milliseconds = label.daily_label_time;
          let seconds = Math.floor(milliseconds / 1000);
          let minutes = Math.floor(seconds / 60);
          let hours = Math.floor(minutes / 60);
          seconds = seconds % 60;
          minutes = seconds >= 60 ? minutes + 1 : minutes;
          minutes = minutes % 60;
          if (minutes < 10) {
            minutes = `0${minutes}`;
          }
          let html = `   <div class="label-times-card">
          <h4>${label.name}</h4>
          <div class="label-times-card-times">
            <div class="label-times-card-times-specific">
              <h6>Today</h6>
              <p>${hours}h${minutes}</p>
            </div>
            <div class="label-times-card-times-specific">
              <h6>Total</h6>
              <p>${totalhours}h${totalminutes}</p>
            </div>
          </div>
        </div>`;
          this.labeltimesTarget.insertAdjacentHTML("beforeend", html);
        });
      });
  }

  startInteraction(event) {
    SignalDispatcher.dispatchSignal("interrupt.celebrate");
  }
}
