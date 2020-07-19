"use strict";

const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MergeJsonPlugin = require("merge-json-webpack-plugin");

const isFirefox = process.env.PLATFORM === "firefox";

module.exports = ({ outDir, env }) => {
  const isDevMode = env === "development";

  return {
    devtool: false,
    entry: {
      background: "./src/background",
      content: "./src/content",
      "context-menu": "./src/content/context-menu",
      options: isDevMode
        ? ["react-devtools", "./src/options"]
        : "./src/options",
    },
    mode: env,
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
      path: outDir,
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
          {
            from: "icons/",
            to: "icons/",
            toType: "dir",
          },
        ],
      }),
      new MergeJsonPlugin({
        group: [
          {
            files: [
              "src/manifest.json",
              isFirefox && "src/firefox-manifest.json",
              `src/${isDevMode ? "dev" : "prod"}-manifest.json`,
            ].filter(Boolean),
            to: "manifest.json",
          },
        ],
      }),
      !isDevMode && new CleanWebpackPlugin(),
      new webpack.ProgressPlugin(),
    ].filter(Boolean),
    watch: isDevMode,
  };
};
