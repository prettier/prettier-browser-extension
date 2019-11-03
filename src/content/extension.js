import GitHub from "./github";
import StackOverflow from "./stackOverflow";
import Storage from "./storage";

const GITHUB_URL = "https://github.com";
const STACKOVERFLOW_URL = "https://stackoverflow.com";
const STACKOVERFLOW_VALID_PATHNAMES = /(^\/questions|\/posts\/\d+\/edit)/u;

export default class Extension {
  constructor() {
    this._buttons = null;
    this._storage = new Storage();
  }

  async init() {
    await this._storage.init();

    if (window.location.origin === GITHUB_URL) {
      this._buttons = new GitHub(this._storage);
    }

    if (
      window.location.origin === STACKOVERFLOW_URL &&
      STACKOVERFLOW_VALID_PATHNAMES.test(window.location.pathname)
    ) {
      this._buttons = new StackOverflow(this._storage);
    }
  }
}
