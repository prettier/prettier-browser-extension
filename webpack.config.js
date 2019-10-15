const path = require("path");

module.exports = {
  entry: "./ext/src/content/content",
  mode: "production",
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, "ext")
  }
};
