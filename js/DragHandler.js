export default class DragHandler {
  #container;
  #onOrderChange;
  #touchItem = null;
  #clone = null;
  #offsetY = 0;

  constructor(container, onOrderChange) {
    this.#container = container;
    this.#onOrderChange = onOrderChange;
  }

  bind() {
    this.#container.querySelectorAll(".color-item").forEach((item) => {
      item.setAttribute("draggable", "true");
      item.addEventListener("dragstart", (e) => this.#onDragStart(e, item));
      item.addEventListener("dragend",   () => this.#onDragEnd(item));
      item.addEventListener("dragover",  (e) => this.#onDragOver(e));
    });

    this.#container.addEventListener("touchstart", (e) => this.#onTouchStart(e), { passive: false });
    this.#container.addEventListener("touchmove",  (e) => this.#onTouchMove(e),  { passive: false });
    this.#container.addEventListener("touchend",   (e) => this.#onTouchEnd(e));
  }

  #onDragStart(e, item) {
    setTimeout(() => item.classList.add("dragging"), 0);
    this.#container._dragged = item;
    e.dataTransfer.effectAllowed = "move";
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

  #onTouchStart(e) {
    const handle = e.target.closest(".drag-handle");
    if (!handle) return;
    const item = handle.closest(".color-item");
    if (!item) return;

    e.preventDefault();
    this.#touchItem = item;

    const rect = item.getBoundingClientRect();
    this.#offsetY = e.touches[0].clientY - rect.top;

    this.#clone = item.cloneNode(true);
    Object.assign(this.#clone.style, {
      position: "fixed",
      left: rect.left + "px",
      width: rect.width + "px",
      top: rect.top + "px",
      opacity: "0.85",
      pointerEvents: "none",
      zIndex: "9999",
      margin: "0",
    });
    document.body.appendChild(this.#clone);
    item.classList.add("dragging");
  }

  #onTouchMove(e) {
    if (!this.#touchItem) return;
    e.preventDefault();

    const y = e.touches[0].clientY;
    if (this.#clone) {
      this.#clone.style.top = (y - this.#offsetY) + "px";
    }

    const after = this.#getElementAfter(y);
    after
      ? this.#container.insertBefore(this.#touchItem, after)
      : this.#container.appendChild(this.#touchItem);
  }

  #onTouchEnd(e) {
    if (!this.#touchItem) return;
    this.#touchItem.classList.remove("dragging");
    if (this.#clone) {
      this.#clone.remove();
      this.#clone = null;
    }
    this.#touchItem = null;
    this.#saveOrder();
  }

  #getElementAfter(y) {
    const items = [...this.#container.querySelectorAll(".color-item:not(.dragging)")];
    return items.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
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