import GitHub from "./github";
import LeetCode from "./leetCode";
import StackOverflow from "./stackOverflow";

import Storage from "./storage";

const extensions = [GitHub, StackOverflow, LeetCode];

export default class {
  constructor() {
    this._storage = new Storage();
  }

  async init() {
    await this._storage.init();

    for (const Extension of extensions) {
      if (Extension.test()) {
        new Extension(this._storage);
        break;
      }
    }
  }
}
