import { findWithClass, isElementVisible } from "./domUtils";
import renderButton from "./button";

test("findWithClass", () => {
  const prettierButton = renderButton(document.body);
  expect(findWithClass(prettierButton, "comment-form-textarea")).toBeNull();

  // Basis: https://github.com/prettier/prettier-chrome-extension/issues/new
  const textarea = document.createElement("textarea");
  textarea.className = "comment-form-textarea";
  document.body.appendChild(textarea);
  expect(findWithClass(prettierButton, "comment-form-textarea")).toBe(textarea);
});

test("isElementVisible", () => {
  const element = document.createElement("div");
  expect(isElementVisible(element)).toBeFalsy();

  Object.defineProperty(element, "offsetHeight", { value: 1 });
  expect(isElementVisible(element)).toBeTruthy();
});
