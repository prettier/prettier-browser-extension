import { createStorage, expectToFormat } from "./testUtils";
import GitHub from "./github";

test("GitHub", async () => {
  // Basis: https://github.com/prettier/prettier-chrome-extension/issues/new
  const button = document.createElement("button");
  button.innerText = "Comment";
  document.body.appendChild(button);
  const textarea = document.createElement("textarea");
  textarea.className = "comment-form-textarea";
  document.body.appendChild(textarea);
  // Hack around JSDOM's lack of offsetHeight support to fix isElementVisible
  Object.defineProperty(document.body, "offsetHeight", { value: 1 });
  // Emulate a matching GitHub pathname
  Object.defineProperty(window, "location", {
    value: { pathname: "/prettier/prettier-chrome-extension/issues/new" }
  });

  new GitHub(await createStorage());
  expectToFormat(textarea);
});
