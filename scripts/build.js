"use strict";

const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const archiver = require("archiver");
const { ensureDir, remove } = require("fs-extra");

const { version } = require("../package.json");
const webpackConfig = require("../webpack.config");

const platform = process.env.PLATFORM;

if (!platform) {
  throw new Error("Missing platform environment variable");
}

const rootDir = process.cwd();

const outDir = path.resolve(rootDir, "extension", platform);

const artifactsDir = path.resolve(rootDir, "artifacts");
const zipPath = path.join(
  artifactsDir,
  `/prettier-${platform}-v${version}.zip`
);

// remove previous artifacts
const preprocess = async () => {
  await ensureDir(artifactsDir);
  await remove(zipPath);
};

const build = async () => {
  const config = webpackConfig({
    env: "production",
    outDir,
  });

  const compiler = webpack(config);

  await new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      console.log(
        stats.toString({
          colors: true,
        })
      );

      if (err) {
        console.log(err);
        return reject(err);
      }

      resolve();
    });
  });
};

const createArchive = async () => {
  // create a file to stream archive data to.
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  await new Promise((resolve, reject) => {
    archive
      .directory(outDir, false)
      .on("error", (err) => reject(err))
      .pipe(output);
    archive.finalize();
    output.on("close", () => resolve());
  });
};

const run = async () => {
  await preprocess();
  await build();
  await createArchive();
};

run();
