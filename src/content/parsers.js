import parserAngular from "prettier/parser-angular";
import parserBabel from "prettier/parser-babel";
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
