export default class GalleryRenderer {
  #container;
  #db;
  #onImageDeleted;

  constructor(container, db, onImageDeleted) {
    this.#container = container;
    this.#db = db;
    this.#onImageDeleted = onImageDeleted;
  }

  async render(order) {
    this.#container.innerHTML = "";

    for (const id of order) {
      const state = await this.#db.getState(id);
      if (state?.imageBlob) {
        this.#container.appendChild(this.#createItem(id, state.imageBlob));
      }
    }
  }

  async printAll(order) {
    for (const id of order) {
      const state = await this.#db.getState(id);
      if (!state?.imageBlob) continue;

      const url = URL.createObjectURL(state.imageBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${id}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  #createItem(id, imageBlob) {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.id = `gallery-item-${id}`;

    item.innerHTML = `
      <button class="delete-btn" id="delete-${id}">✕</button>
      <img class="gallery-img" src="${URL.createObjectURL(imageBlob)}">
    `;

    item.querySelector(`#delete-${id}`).addEventListener("click", async () => {
      await this.#db.clearImage(id);
      item.remove();
      this.#onImageDeleted(id);
    });

    return item;
  }
}
