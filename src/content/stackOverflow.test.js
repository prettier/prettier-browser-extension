import { createStorage, expectToFormat } from "./testUtils";
import StackOverflow from "./stackOverflow";

test("Stack Overflow", async () => {
  // Basis: https://stackoverflow.com/questions/51875054
  const button = document.createElement("div");
  button.className = "wmd-button-row";
  document.body.appendChild(button);
  const textarea = document.createElement("textarea");
  textarea.className = "wmd-input";
  document.body.appendChild(textarea);

  new StackOverflow(await createStorage());
  expectToFormat(textarea);
});
