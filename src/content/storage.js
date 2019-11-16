import { promisifiedChromeStorageSyncGet } from "../shared/chrome";

export default class Storage {
  constructor() {
    this._cache = {};
  }

  init() {
    chrome.storage.onChanged.addListener(() => this._update());
    return this._update();
  }

  get(key = null) {
    if (key) {
      if (this._cache[key] === undefined) {
        return null;
      }

      return this._cache[key];
    }

    return this._cache;
  }

  async _update() {
    const data = await promisifiedChromeStorageSyncGet();
    this._cache = { ...data };
  }
}
