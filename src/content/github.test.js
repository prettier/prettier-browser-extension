import { createStorage, expectToHavePrettierButton } from "./testUtils";
import GitHub from "./github";

test("GitHub", async () => {
  // Basis: https://github.com/prettier/prettier-chrome-extension/issues/new
  const button = document.createElement("button");
  button.innerText = "Comment";
  document.body.appendChild(button);

  new GitHub(await createStorage())._createGithubPrettierButtons();
  expectToHavePrettierButton();
});
