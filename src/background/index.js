import browser from "webextension-polyfill";

const menuItemId = "prettier-format";

const menuItem = {
  contexts: ["editable"],
  id: menuItemId,
  title: "Format with Prettier",
};

const format = () => {
  return browser.tabs
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
};

browser.commands.onCommand.addListener((command) => {
  if (command !== "run-prettier-format") {
    return;
  }

  format();
});

const createContextMenu = async () => {
  try {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create(menuItem);

    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId == menuItemId) {
        format();
      }
    });
  } catch (err) {
    console.log("Error while initializing context menu", err);
  }
};

createContextMenu();
