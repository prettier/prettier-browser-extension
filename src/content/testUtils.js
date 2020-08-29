import "@testing-library/jest-dom/extend-expect";
import { fireEvent, getByText } from "@testing-library/dom";
import Storage from "./storage";

window.MutationObserver = class {
  constructor() {}
  observe() {}
};

export async function createStorage() {
  const storage = new Storage();
  await storage.init();
  return storage;
}

export function expectToFormat(textarea) {
  fireEvent.change(textarea, {
    target: { value: "```js\nconst variable=value\n```" },
  });
  fireEvent.click(getByText(document, "Prettier"));
  expect(textarea).toHaveValue("```js\nconst variable = value;\n```\n");
}
