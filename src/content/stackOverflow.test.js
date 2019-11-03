import { createStorage, expectToHavePrettierButton } from "./testUtils";
import StackOverflow from "./stackOverflow";

test("Stack Overflow", async () => {
  // Basis: https://stackoverflow.com/questions/51875054
  const button = document.createElement("div");
  button.className = "wmd-button-row";
  document.body.appendChild(button);

  new StackOverflow(await createStorage());
  expectToHavePrettierButton();
});
