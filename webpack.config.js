const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack

module.exports = {
  entry: "./extension/src/content/index.js",
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          extractComments: false,

          // https://github.com/webpack-contrib/terser-webpack-plugin/issues/107
          output: { ascii_only: true }
        }
      })
    ]
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "extension/dist")
  },
  performance: {
    hints: false
  }
};
