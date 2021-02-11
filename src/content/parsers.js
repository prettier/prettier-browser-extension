import parserAngular from "prettier/esm/parser-angular";
import parserBabel from "prettier/esm/parser-babel";
import parserFlow from "prettier/esm/parser-flow";
import parserGlimmer from "prettier/esm/parser-glimmer";
import parserGraphql from "prettier/esm/parser-graphql";
import parserHtml from "prettier/esm/parser-html";
import parserMarkdown from "prettier/esm/parser-markdown";
import parserPostcss from "prettier/esm/parser-postcss";
import parserTypescript from "prettier/esm/parser-typescript";
import parserYaml from "prettier/esm/parser-yaml";

export const PARSERS = [
  parserAngular,
  parserBabel,
  parserFlow,
  parserGlimmer,
  parserGraphql,
  parserHtml,
  parserMarkdown,
  parserPostcss,
  parserTypescript,
  parserYaml,
];

export const PARSERS_LANG_MAP = {
  css: "css",
  flow: "flow",
  html: "html",
  javascript: "babel",
  js: "babel",
  json: "babel",
  less: "css",
  sass: "css",
  scss: "css",
  ts: "typescript",
  typescript: "typescript",
  yaml: "yaml",
};
