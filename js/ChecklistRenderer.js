import DragHandler from "./DragHandler.js";

export default class ChecklistRenderer {
  #container;
  #db;
  #colors;
  #onOrderChange;

  constructor(container, db, colors, onOrderChange) {
    this.#container = container;
    this.#db = db;
    this.#colors = colors;
    this.#onOrderChange = onOrderChange;
  }

  async render(order) {
    this.#container.innerHTML = "";

    for (const id of order) {
      const color = this.#colors.find((c) => c.id === id);
      if (!color) continue;

      const state = await this.#db.getState(id);
      const checked = state ? state.checked : false;

      const item = this.#createItem(color, checked);
      this.#container.appendChild(item);
      this.#bindItemEvents(item, id);
    }

    new DragHandler(this.#container, this.#onOrderChange).bind();
  }

  #createItem(color, checked) {
    const item = document.createElement("div");
    item.className = "color-item";
    item.id = `item-${color.id}`;
    item.draggable = true;

    item.innerHTML = `
      <div class="left-side">
        <span class="drag-handle">☰</span>
        <span class="indicator" style="background-color: ${color.hex};"></span>
        <span class="color-name">${color.name}</span>
      </div>
      <div class="right-side">
        <label id="label-${color.id}" class="upload-btn" style="display: ${checked ? "none" : "inline-block"};">
          Img
          <input type="file" accept="image/*" id="file-${color.id}" style="display: none;">
        </label>
        <input type="checkbox" class="status-checkbox" id="check-${color.id}" ${checked ? "checked" : ""}>
      </div>
    `;

    return item;
  }

  #bindItemEvents(item, id) {
    const checkbox = item.querySelector(`#check-${id}`);
    const fileInput = item.querySelector(`#file-${id}`);
    const label = item.querySelector(`#label-${id}`);

    checkbox.addEventListener("change", async (e) => {
      const checked = e.target.checked;
      label.style.display = checked ? "none" : "inline-block";

      if (!checked) {
        await this.#db.clearImage(id);
      } else {
        const current = await this.#db.getState(id);
        await this.#db.setState(id, true, current?.imageBlob ?? null);
      }
    });

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      await this.#db.setState(id, true, file);
      checkbox.checked = true;
      label.style.display = "none";

      this.#container.dispatchEvent(
        new CustomEvent("imageUploaded", { bubbles: true }),
      );
    });
  }
}
