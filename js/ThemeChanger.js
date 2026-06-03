export default class ThemeChanger {
  #container;
  #colorIds;

  constructor(container, colors) {
    this.#container = container;
    this.#colorIds = colors.map((c) => c.id);
  }

  bind() {
    this.#container.addEventListener("click", (e) => {
      const nameSpan = e.target.closest(".indicator");
      if (!nameSpan) return;

      const item = nameSpan.closest(".color-item");
      if (!item) return;

      const colorId = item.id.replace("item-", "");
      if (!this.#colorIds.includes(colorId)) return;

      this.#applyTheme(colorId);
    });
  }

  #applyTheme(colorId) {
    this.#colorIds.forEach((id) =>
      document.documentElement.classList.remove(id),
    );
    document.documentElement.classList.add(colorId);
  }
}
