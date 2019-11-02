const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => ({
  devtool: false,
  entry: {
    content: "./src/content/index.js",
    options:
      argv.mode === "development"
        ? ["react-devtools", "./src/options/index.js"]
        : "./src/options/index.js"
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
    path: path.resolve(__dirname, "dist")
  },
  performance: {
    hints: false
  },
  plugins: [
    new CopyPlugin([
      "manifest.json",
      {
        from: "icons/",
        to: "icons/",
        toType: "dir"
      },
      {
        flatten: true,
        from: "src/options/index.{html,css}",
        to: "options.[ext]"
      }
    ])
  ],
  stats: {
    warningsFilter:
      // Remove after upgrading to Prettier 1.19
      "require.extensions is not supported by webpack. Use a loader instead."
  },
  watch: argv.mode === "development"
});
