export default {
  storage: {
    sync: {
      get(callback) {
        setTimeout(() => callback({}));
      },
      set() {},
    },
  },
};
