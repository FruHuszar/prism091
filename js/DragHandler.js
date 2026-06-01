export default class DragHandler {
  #container;
  #onOrderChange;
  #touchItem = null;

  constructor(container, onOrderChange) {
    this.#container = container;
    this.#onOrderChange = onOrderChange;
  }

  bind() {
    this.#container.querySelectorAll(".color-item").forEach((item) => {
      item.addEventListener("dragstart", () => this.#onDragStart(item));
      item.addEventListener("dragend",   () => this.#onDragEnd(item));
      item.addEventListener("dragover",  (e) => this.#onDragOver(e));
      item.addEventListener("touchstart", (e) => this.#onTouchStart(e, item), { passive: false });
      item.addEventListener("touchmove",  (e) => this.#onTouchMove(e),        { passive: false });
      item.addEventListener("touchend",   () => this.#onTouchEnd());
    });
  }

  #onDragStart(item) {
    setTimeout(() => item.classList.add("dragging"), 0);
    this.#container._dragged = item;
  }

  #onDragEnd(item) {
    item.classList.remove("dragging");
    this.#container._dragged = null;
    this.#saveOrder();
  }

  #onDragOver(e) {
    e.preventDefault();
    const dragged = this.#container._dragged;
    if (!dragged) return;
    const after = this.#getElementAfter(e.clientY);
    after ? this.#container.insertBefore(dragged, after) : this.#container.appendChild(dragged);
  }

  #onTouchStart(e, item) {
    if (!e.target.classList.contains("drag-handle")) return;
    this.#touchItem = item;
    item.classList.add("dragging");
  }

  #onTouchMove(e) {
    if (!this.#touchItem) return;
    e.preventDefault();
    const after = this.#getElementAfter(e.touches[0].clientY);
    after ? this.#container.insertBefore(this.#touchItem, after) : this.#container.appendChild(this.#touchItem);
  }

  #onTouchEnd() {
    if (!this.#touchItem) return;
    this.#touchItem.classList.remove("dragging");
    this.#touchItem = null;
    this.#saveOrder();
  }

  #getElementAfter(y) {
    const items = [...this.#container.querySelectorAll(".color-item:not(.dragging)")];
    return items.reduce((closest, child) => {
      const offset = y - child.getBoundingClientRect().top - child.getBoundingClientRect().height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  #saveOrder() {
    const order = [...this.#container.querySelectorAll(".color-item")]
      .map((el) => el.id.replace("item-", ""));
    this.#onOrderChange(order);
  }
}
