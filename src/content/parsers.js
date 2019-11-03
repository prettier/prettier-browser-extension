import parserAngular from "prettier/parser-angular";
import parserBabylon from "prettier/parser-babylon";
import parserFlow from "prettier/parser-flow";
import parserGlimmer from "prettier/parser-glimmer";
import parserGraphql from "prettier/parser-graphql";
import parserHtml from "prettier/parser-html";
import parserMarkdown from "prettier/parser-markdown";
import parserPostcss from "prettier/parser-postcss";
import parserTypescript from "prettier/parser-typescript";
import parserYaml from "prettier/parser-yaml";

export const PARSERS = [
  parserAngular,
  parserBabylon,
  parserFlow,
  parserGlimmer,
  parserGraphql,
  parserHtml,
  parserMarkdown,
  parserPostcss,
  parserTypescript,
  parserYaml
];

export const PARSERS_LANG_MAP = {
  css: "css",
  flow: "flow",
  html: "html",
  javascript: "babel",
  js: "babel",
  json: "babel",
  less: "postcss",
  sass: "postcss",
  scss: "postcss",
  ts: "typescript",
  typescript: "typescript",
  yaml: "yaml"
};
