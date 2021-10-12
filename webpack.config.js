/** @typedef {import('webpack').Configuration} WebpackConfig * */

"use strict";

const path = require("path");

const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack
const CopyPlugin = require("copy-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MergeJsonPlugin = require("merge-json-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

const { version } = require("./package.json");
const SUPPORTED_PLATFORMS = ["chrome", "firefox"];

/** @type WebpackConfig */
module.exports = (env, argv) => {
  const { platform } = env;

  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    throw new Error(
      `Unsupported platform. Platform should be one of: ${SUPPORTED_PLATFORMS.join(
        ", "
      )}`
    );
  }

  const isDevMode = argv.mode === "development";

  const rootDir = process.cwd();
  const outDir = path.resolve(rootDir, "extension", platform);
  const isFirefox = platform === "firefox";

  return {
    devtool: false,
    entry: {
      background: "./src/background/index.js",
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
          test: /\.svg$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[hash][ext]",
          },
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
            // https://github.com/webpack-contrib/terser-webpack-plugin/issues/107
            output: { ascii_only: true },
          },
        }),
      ],
    },
    output: {
      clean: true,
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
            from: "assets/icons/",
            to: "icons/",
            toType: "dir",
          },
        ],
      }),
      new MergeJsonPlugin({
        groups: [
          {
            files: [
              "src/manifest.json",
              isFirefox && "src/firefox-manifest.json",
            ].filter(Boolean),
            to: "manifest.json",
            transform: (manifest) => ({ version, ...manifest }),
          },
        ],
      }),
      new webpack.ProgressPlugin(),
      !isDevMode &&
        new FileManagerPlugin({
          events: {
            onEnd: {
              archive: [
                {
                  source: outDir,
                  destination: `artifacts/prettier-${platform}-v${version}.zip`,
                },
              ],
            },
          },
        }),
    ].filter(Boolean),
    resolve: {
      extensions: [".mjs", ".js"],
    },
  };
};
