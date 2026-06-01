export default class Database {
  constructor() {
    this.db = new Dexie("RainbowHuntDB");
    this.db.version(2).stores({
      progress: "id, checked, imageBlob",
      settings: "key, value",
    });
  }

  async getOrder() {
    const record = await this.db.settings.get("colorOrder");
    return record ? record.value : null;
  }

  async setOrder(order) {
    await this.db.settings.put({ key: "colorOrder", value: order });
  }

  async getState(id) {
    return await this.db.progress.get(id);
  }

  async setState(id, checked, imageBlob = null) {
    await this.db.progress.put({ id, checked, imageBlob });
  }

  async clearImage(id) {
    await this.db.progress.put({ id, checked: false, imageBlob: null });
  }

  async clearAll() {
    await this.db.progress.clear();
    await this.db.settings.clear();
  }
}
