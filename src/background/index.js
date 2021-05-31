import browser from "webextension-polyfill";

const menuItemId = "prettier-format";

const menuItem = {
  contexts: ["editable"],
  id: menuItemId,
  title: "Format with Prettier",
};

const format = async (tab) => {
  try {
    await browser.tabs.sendMessage(tab.id, { action: "runPrettierFormat" });
  } catch (err) {
    console.error("Error occurred while sending message to tab.", err);
  }
};

browser.commands.onCommand.addListener((command, tab) => {
  if (command !== "run-prettier-format") {
    return;
  }

  format(tab);
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == menuItemId) {
    format(tab);
  }
});

const createContextMenu = async () => {
  try {
    await browser.contextMenus.removeAll();
    await browser.contextMenus.create(menuItem);
  } catch (err) {
    console.log("Error while creating context menu", err);
  }
};

createContextMenu();
