import browser from "webextension-polyfill";

export default class Storage {
  constructor() {
    this._cache = {};
  }

  init() {
    browser.storage.onChanged.addListener(() => this._update());
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
    const data = await browser.storage.sync.get();
    this._cache = { ...data };
  }
}
