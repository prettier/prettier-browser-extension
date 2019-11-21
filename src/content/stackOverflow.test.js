import StackOverflow from "./stackOverflow";
import { createStorage } from "./testUtils";
import { getByText } from "@testing-library/dom";

test("Stack Overflow", async () => {
  // Basis: https://stackoverflow.com/questions/51875054
  const button = document.createElement("div");
  button.className = "wmd-button-row";
  document.body.appendChild(button);

  new StackOverflow(await createStorage());
  getByText(document, "Prettier");
});
