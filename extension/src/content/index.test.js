import "@testing-library/jest-dom/extend-expect";
import { createGithubPrettierButtons, initStackOverflowButton } from ".";

describe("Prettier format button injection", () => {
  function expectToHavePrettierButton() {
    expect(document.querySelector(".prettier-btn")).toHaveTextContent(
      "Prettier"
    );
  }

  beforeEach(() => (document.body.innerHTML = ""));

  test("GitHub", () => {
    // Basis: https://github.com/prettier/prettier-chrome-extension/issues/new
    const button = document.createElement("button");
    button.innerText = "Comment";
    document.body.appendChild(button);

    createGithubPrettierButtons();
    expectToHavePrettierButton();
  });

  test("Stack Overflow", () => {
    // Basis: https://stackoverflow.com/questions/51875054
    const button = document.createElement("div");
    button.className = "wmd-button-row";
    document.body.appendChild(button);

    initStackOverflowButton();
    expectToHavePrettierButton();
  });
});
