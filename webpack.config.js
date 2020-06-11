/* eslint-env node */
"use strict";
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isDevMode = argv.mode === "development";
  const target = env.platform;

  return {
    devtool: false,
    entry: {
      content: "./src/content/index.js",
      options: isDevMode
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
      path: path.resolve(__dirname, "extension", target),
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
          `${target}/manifest.json`,
          {
            from: "icons/",
            to: "icons/",
            toType: "dir",
          },
        ],
      }),
      new CleanWebpackPlugin(),
      new webpack.ProgressPlugin(),
    ],
    watch: isDevMode,
  };
};
