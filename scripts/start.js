"use strict";

const path = require("path");
const webpack = require("webpack");

const webpackConfig = require("../webpack.config");

const platform = process.env.PLATFORM;

if (!platform) {
  throw new Error("Missing platform environment variable");
}

const rootDir = process.cwd();
const outDir = path.resolve(rootDir, "extension", platform);

const config = webpackConfig({
  env: "development",
  outDir,
});

const compiler = webpack(config);

const webpackWatcher = compiler.watch({}, (err, stats) => {
  if (err) {
    console.log(err);
  }
  console.log(
    stats.toString({
      colors: true,
    })
  );
});

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => {
    webpackWatcher.close();
    process.exit();
  });
});
