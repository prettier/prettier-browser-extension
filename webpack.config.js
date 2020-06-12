"use strict";

const TerserPlugin = require("terser-webpack-plugin"); // included as a dependency of webpack
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HTMLPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = ({ outDir, env, manifestPath }) => {
  const isDevMode = env === "development";

  return {
    devtool: false,
    entry: {
      content: "./src/content/index.js",
      options: isDevMode
        ? ["react-devtools", "./src/options/index.js"]
        : "./src/options/index.js",
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
          manifestPath,
          {
            from: "icons/",
            to: "icons/",
            toType: "dir",
          },
        ],
      }),
      !isDevMode && new CleanWebpackPlugin(),
      new webpack.ProgressPlugin(),
    ].filter(Boolean),
    watch: isDevMode,
  };
};
