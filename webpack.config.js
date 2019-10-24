const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack

module.exports = {
  entry: {
    content: "./extension/src/content/index.js",
    options: "./extension/src/options/index.js"
  },
  mode: "production",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"]
          }
        }
      }
    ]
  },
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
    path: path.resolve(__dirname, "extension/dist")
  },
  performance: {
    hints: false
  }
};
