import GitHub from "./github";
import { createStorage } from "./testUtils";
import { getByText } from "@testing-library/dom";

test("GitHub", async () => {
  // Basis: https://github.com/prettier/prettier-chrome-extension/issues/new
  const button = document.createElement("button");
  button.innerText = "Comment";
  document.body.appendChild(button);
  // Hack around JSDOM's lack of offsetHeight support to fix isElementVisible
  Object.defineProperty(document.body, "offsetHeight", { value: 1 });
  // Emulate a matching GitHub pathname
  Object.defineProperty(window, "location", {
    value: { pathname: "/prettier/prettier-chrome-extension/issues/new" }
  });

  new GitHub(await createStorage());
  getByText(document, "Prettier");
});
