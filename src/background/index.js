import browser from "webextension-polyfill";

browser.commands.onCommand.addListener((command) => {
  if (command !== "run-prettier-format") {
    return;
  }

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) =>
      Promise.all(
        tabs.map((tab) =>
          browser.tabs.sendMessage(tab.id, { action: "runPrettierFormat" })
        )
      )
    )
    .catch((err) => {
      console.error("Error occurred while sending message to tab.", err);
    });
});
