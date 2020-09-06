import Storage from "./storage";
import browser from "webextension-polyfill";

test("Storage", async () => {
  const storage = new Storage();
  expect(storage.get()).toEqual({});

  await storage.init();
  await browser.storage.sync.set({ valid: true });
  expect(storage.get("valid")).toBeTruthy();
  expect(storage.get("invalid")).toBeNull();
});
