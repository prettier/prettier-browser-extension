export default {
  runtime: {},
  storage: {
    onChanged: {
      addListener() {}
    },
    sync: {
      get() {
        return new Promise(resolve => setTimeout(() => resolve({})));
      }
    }
  }
};
