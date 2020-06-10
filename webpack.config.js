/* eslint-env node */
"use strict";
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack
const CopyPlugin = require("copy-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => ({
  devtool: false,
  entry: {
    content: "./src/content/index.js",
    options:
      argv.mode === "development"
        ? ["react-devtools", "./src/options/index.js"]
        : "./src/options/index.js",
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: "babel-loader",
      },
      {
        test: /\.svg$/,
        use: "@svgr/webpack",
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          extractComments: false,

          // https://github.com/webpack-contrib/terser-webpack-plugin/issues/107
          output: { ascii_only: true },
        },
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, "extension"),
  },
  performance: {
    hints: false,
  },
  plugins: [
    new HTMLPlugin({
      chunks: ["options"],
      filename: "options.html",
      template: "src/options/index.html",
    }),
    new CopyPlugin({
      patterns: [
        "manifest.json",
        {
          from: "icons/",
          to: "icons/",
          toType: "dir",
        },
      ],
    }),
  ],
  watch: argv.mode === "development",
});
