const listeners = [];
let storageItems = {};

function callListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export default {
  storage: {
    onChanged: {
      addListener(listener) {
        listeners.push(listener);
      }
    },
    sync: {
      async get() {
        return storageItems;
      },
      async set(newItems) {
        await Promise.resolve();
        storageItems = { ...storageItems, ...newItems };
        callListeners();
      }
    }
  }
};
