const path = require("path");

module.exports = {
  entry: "./ext/src/content/content",
  mode: "development",
  output: {
    path: path.resolve(__dirname, "ext")
  }
};
