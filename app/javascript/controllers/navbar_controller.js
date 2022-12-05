import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="navbar"
export default class extends Controller {
  static targets = [
    "tasks",
    "timers",
    "music",
    "data",
    "taskbtn",
    "timerbtn",
    "musicbtn",
    "databtn",
    "param",
    "parambtn",
    "welcome",
    "welcomebtn",
    "data2",
    "data1",
  ];

  // connect() {
  //   console.log("navbar controller connected!");
  // }

  displayTasks() {
    event.preventDefault();
    this.tasksTarget.classList.toggle("d-none");
    this.taskbtnTarget.classList.toggle("circle");
    this.timersTarget.classList.add("d-none");
    this.timerbtnTarget.classList.remove("circle");
    this.musicTarget.classList.add("d-none");
    this.musicbtnTarget.classList.remove("circle");
    this.dataTarget.classList.add("d-none");
    this.databtnTarget.classList.remove("circle");
    this.paramTarget.classList.add("d-none");
    this.parambtnTarget.classList.remove("circle");
    this.welcomeTarget.classList.add("d-none");
  }

  displayTimers() {
    event.preventDefault();
    this.timersTarget.classList.toggle("d-none");
    this.timerbtnTarget.classList.toggle("circle");
    this.tasksTarget.classList.add("d-none");
    this.taskbtnTarget.classList.remove("circle");
    this.musicTarget.classList.add("d-none");
    this.musicbtnTarget.classList.remove("circle");
    this.dataTarget.classList.add("d-none");
    this.databtnTarget.classList.remove("circle");
    this.paramTarget.classList.add("d-none");
    this.parambtnTarget.classList.remove("circle");
    this.welcomeTarget.classList.add("d-none");
  }

  displayMusic() {
    event.preventDefault();
    this.musicTarget.classList.toggle("d-none");
    this.musicbtnTarget.classList.toggle("circle");
    this.tasksTarget.classList.add("d-none");
    this.taskbtnTarget.classList.remove("circle");
    this.timersTarget.classList.add("d-none");
    this.timerbtnTarget.classList.remove("circle");
    this.dataTarget.classList.add("d-none");
    this.databtnTarget.classList.remove("circle");
    this.paramTarget.classList.add("d-none");
    this.parambtnTarget.classList.remove("circle");
    this.welcomeTarget.classList.add("d-none");
  }

  displayData() {
    event.preventDefault();
    this.dataTarget.classList.toggle("d-none");
    this.databtnTarget.classList.toggle("circle");
    this.tasksTarget.classList.add("d-none");
    this.taskbtnTarget.classList.remove("circle");
    this.musicTarget.classList.add("d-none");
    this.musicbtnTarget.classList.remove("circle");
    this.timersTarget.classList.add("d-none");
    this.timerbtnTarget.classList.remove("circle");
    this.paramTarget.classList.add("d-none");
    this.parambtnTarget.classList.remove("circle");
    this.welcomeTarget.classList.add("d-none");
  }

  displayParam() {
    event.preventDefault();
    this.paramTarget.classList.toggle("d-none");
    this.parambtnTarget.classList.toggle("circle");
    this.dataTarget.classList.add("d-none");
    this.databtnTarget.classList.remove("circle");
    this.tasksTarget.classList.add("d-none");
    this.taskbtnTarget.classList.remove("circle");
    this.musicTarget.classList.add("d-none");
    this.musicbtnTarget.classList.remove("circle");
    this.timersTarget.classList.add("d-none");
    this.timerbtnTarget.classList.remove("circle");
    this.welcomeTarget.classList.add("d-none");
  }

  displayTaskAfterWelcome(event) {
    event.preventDefault();
    this.welcomeTarget.classList.add("d-none");
    this.taskbtnTarget.classList.add("circle");
    this.tasksTarget.classList.remove("d-none");
  }

  displayDataTwo(event) {
    console.log(this.data2btnTarget);
    this.data1Target.classList.toggle("d-none");
    this.data2Target.classList.remove("d-none");
  }
}
