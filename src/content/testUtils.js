import "@testing-library/jest-dom/extend-expect";
import Storage from "./storage";

window.MutationObserver = class {
  constructor() {}
  observe() {}
};

export function createStorage() {
  const storage = new Storage();
  return storage.init();
}

export function expectToHavePrettierButton() {
  expect(document.querySelector(".prettier-btn")).toHaveTextContent("Prettier");
}
