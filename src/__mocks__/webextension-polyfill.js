export default {
  runtime: {},
  storage: {
    onChanged: {
      addListener() {}
    },
    sync: {
      get() {
        return Promise.resolve({});
      }
    }
  }
};
