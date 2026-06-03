import Database from "./Database.js";
import ChecklistRenderer from "./ChecklistRenderer.js";
import GalleryRenderer from "./GalleryRenderer.js";
import ThemeChanger from "./ThemeChanger.js";
import colors from "./ColorConfig.js";

class App {
  #db;
  #checklist;
  #gallery;
  #order = [];

  constructor() {
    this.#db = new Database();

    const checklistEl = document.getElementById("checklistContainer");
    const galleryEl = document.getElementById("galleryGrid");
    const drawBtn = document.getElementById("drawBtn");

    this.#checklist = new ChecklistRenderer(
      checklistEl,
      this.#db,
      colors,
      (newOrder) => this.#saveOrder(newOrder),
    );

    new ThemeChanger(checklistEl, colors).bind();

    this.#gallery = new GalleryRenderer(galleryEl, this.#db, (id) =>
      this.#resetChecklistItem(id),
    );

    checklistEl.addEventListener("imageUploaded", () =>
      this.#gallery.render(this.#order),
    );
    drawBtn.addEventListener("click", () => this.#gallery.render(this.#order));

    document
      .getElementById("printBtn")
      .addEventListener("click", () => this.#gallery.printAll(this.#order));

    document.getElementById("deleteBtn").addEventListener("click", async () => {
      await this.#db.clearAll();
      location.reload();
    });

    this.#init();
  }

  async #init() {
    const saved = await this.#db.getOrder();
    this.#order = saved ?? colors.map((c) => c.id);
    if (!saved) await this.#db.setOrder(this.#order);

    await this.#checklist.render(this.#order);
    await this.#gallery.render(this.#order);
  }

  async #saveOrder(newOrder) {
    this.#order = newOrder;
    await this.#db.setOrder(newOrder);
  }

  #resetChecklistItem(id) {
    const checkbox = document.getElementById(`check-${id}`);
    const label = document.getElementById(`label-${id}`);
    if (checkbox) checkbox.checked = false;
    if (label) label.style.display = "inline-block";
  }
}

new App();
