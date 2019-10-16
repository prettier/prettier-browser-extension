const path = require("path");

module.exports = {
  entry: "./extension/src/content/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "extension/dist")
  },
  performance: {
    hints: false
  }
};
