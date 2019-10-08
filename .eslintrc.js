"use strict";

module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    browser: true,
    es6: true
  },
  globals: {
    chrome: true
  }
};
