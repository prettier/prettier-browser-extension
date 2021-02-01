import browser from "webextension-polyfill";

browser.commands.onCommand.addListener((command) => {
  if (command !== "run-prettier-format") {
    return;
  }

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { action: "runPrettierFormat" });
  });
});
