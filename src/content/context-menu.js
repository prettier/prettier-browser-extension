import browser from "webextension-polyfill";

import Storage from "./storage";
import format from "../utils/format";

const storage = new Storage();
const CLASS_NAME = "__PRETTIER_EXTENSION_FORMAT_ELEMENET__";

const formatCode = async () => {
  const inputEl = document.getElementsByClassName(CLASS_NAME)[0];
  if (!inputEl) {
    return;
  }

  const options = {
    parser: "markdown",
    ...storage.get().prettierOptions,
  };

  const formattedText = format(inputEl.value, options);
  inputEl.value = formattedText;

  inputEl.classList.remove(CLASS_NAME);
};

browser.runtime.onMessage.addListener((request) => {
  if (request === "prettierFormat") {
    return formatCode();
  }
});
