const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack

module.exports = (env, argv) => ({
  devtool: false,
  entry: {
    content: "./extension/src/content/index.js",
    options:
      argv.mode === "development"
        ? ["react-devtools", "./extension/src/options/index.js"]
        : "./extension/src/options/index.js"
  },
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
  },
  stats: {
    warningsFilter:
      // Remove after upgrading to Prettier 1.19
      "require.extensions is not supported by webpack. Use a loader instead."
  },
  watch: argv.mode === "development"
});
