import * as PIXI from "pixi.js";
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="game"
export default class extends Controller {
  connect() {
    let app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    document.body.style.margin = "0";
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";

    app.renderer.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", (e) => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    // await load()
    document.body.appendChild(app.view);
  }
}
