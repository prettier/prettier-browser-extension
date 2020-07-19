import browser from "webextension-polyfill";

const menuItemId = "prettier-format";

const handleContextMenuClick = async (info, tab) => {
  await browser.tabs.executeScript(tab.id, {
    code: `
      browser.menus.getTargetElement(${info.targetElementId}).classList.add('${CLASS_NAME}')
    `,
    frameId: info.frameId,
  });
  await browser.tabs.sendMessage(tab.id, "prettierFormat");
};

const CLASS_NAME = "__PRETTIER_EXTENSION_FORMAT_ELEMENET__";

const menuItem = {
  contexts: ["editable"],
  id: menuItemId,
  title: "Format with prettier",
};

const init = async () => {
  try {
    await browser.menus.removeAll();
    browser.menus.create(menuItem);

    browser.menus.onClicked.addListener((info, tab) => {
      if (info.menuItemId == menuItemId) {
        handleContextMenuClick(info, tab);
      }
    });
  } catch (err) {
    console.log("Error while initializing context menu", err);
  }
};

init();
