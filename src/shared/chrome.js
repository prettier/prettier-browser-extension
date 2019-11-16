export function promisifiedChromeStorageSyncGet() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(data => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      resolve(data);
    });
  });
}
