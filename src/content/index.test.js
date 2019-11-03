import "@testing-library/jest-dom/extend-expect";
import GitHub from "./github";
import StackOverflow from "./stackOverflow";
import Storage from "./storage";

window.chrome = {
  runtime: {},
  storage: {
    onChanged: {
      addListener() {}
    },
    sync: {
      get(callback) {
        setTimeout(() => callback({}));
      }
    }
  }
};

window.MutationObserver = class {
  constructor() {}
  observe() {}
};

describe("Prettier format button injection", () => {
  function createStorage() {
    const storage = new Storage();
    return storage.init();
  }

  function expectToHavePrettierButton() {
    expect(document.querySelector(".prettier-btn")).toHaveTextContent(
      "Prettier"
    );
  }

  beforeEach(() => (document.body.innerHTML = ""));

  test("GitHub", async () => {
    // Basis: https://github.com/prettier/prettier-chrome-extension/issues/new
    const button = document.createElement("button");
    button.innerText = "Comment";
    document.body.appendChild(button);

    new GitHub(await createStorage())._createGithubPrettierButtons();
    expectToHavePrettierButton();
  });

  test("Stack Overflow", async () => {
    // Basis: https://stackoverflow.com/questions/51875054
    const button = document.createElement("div");
    button.className = "wmd-button-row";
    document.body.appendChild(button);

    new StackOverflow(await createStorage());
    expectToHavePrettierButton();
  });
});
