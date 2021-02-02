import browser from "webextension-polyfill";

browser.commands.onCommand.addListener((command) => {
  if (command !== "run-prettier-format") {
    return;
  }

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: "runPrettierFormat" });
    })
    .catch((err) => {
      console.error("Error while querying for tabs", err);
    });
});
