/* globals chrome */

chrome.commands.onCommand.addListener((command) => {
  if (command !== "run-prettier-format") {
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "runPrettierFormat" });
  });
});
