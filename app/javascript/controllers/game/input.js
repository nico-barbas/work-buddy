import { Vector2 } from "./math";

// Input is a helper class that:
//  - handles all the common UI behaviors (show/hide panels, highlight on mouseover, etc..)
//  - exposes a convenient mouse position relative to canvas's orgin
export class Input {
  static mouse = new Vector2();
  static previousMouse = new Vector2();
  static mouseDelta = new Vector2();
  static hasInit = false;

  static init() {
    if (this.hasInit) {
      return;
    }

    document.addEventListener("mousemove", (event) => {
      this.previousMouse.x = this.mouse.x;
      this.previousMouse.y = this.mouse.y;
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
      this.mouseDelta.x = this.mouse.x - this.previousMouse.x;
      this.mouseDelta.y = this.mouse.y - this.previousMouse.y;
    });

    // this.initBuildUI();
    // this.initDecorateUI();
    this.hasInit = true;
  }

  // static initBuildUI() {
  //   const menus = document.querySelectorAll(".menu");

  //   const buildBtn = document.querySelector<HTMLDivElement>("#build-icon");
  //   const buildMenu = document.querySelector<HTMLDivElement>("#build-menu");
  //   if (buildBtn != null && buildMenu != null) {
  //     buildBtn.addEventListener("click", (event) => {
  //       this.onIconClicked(buildMenu, menus);
  //     });
  //   }
  // }

  // static initDecorateUI() {
  //   const menus = document.querySelectorAll(".menu");

  //   const decorateBtn = document.querySelector<HTMLDivElement>(
  //     "#decorate-icon"
  //   );
  //   const decorateMenu = document.querySelector<HTMLDivElement>(
  //     "#decorate-menu"
  //   );

  //   if (decorateBtn != null && decorateMenu != null) {
  //     decorateBtn.addEventListener("click", (event) => {
  //       this.onIconClicked(decorateMenu, menus);
  //     });
  //   }
  // }

  // private static onIconClicked(
  //   selected: HTMLElement,
  //   menuGroup: NodeListOf<Element>
  // ) {
  //   menuGroup.forEach((menu) => {
  //     if (menu.id != selected.id) {
  //       const menuEl = menu as HTMLElement;
  //       menuEl.style.display = "none";
  //     }
  //   });

  //   const current = selected.style.display;
  //   if (current === "none") {
  //     selected.style.display = "flex";
  //   } else {
  //     selected.style.display = "none";
  //   }
  // }
}
