import browser from "webextension-polyfill";
import prettier from "prettier/standalone";

import Storage from "./storage";
import { PARSERS, PARSERS_LANG_MAP } from "./parsers";

const STACKEXCHANGE_SITES = [
  "https://stackoverflow.com",
  "https://askubuntu.com",
  "https://mathoverflow.com",
  "https://serverfault.com",
  "https://stackapps.com",
  "https://superuser.com",
];

const STACKEXCHANGE_URL_REGEX = /^https:\/\/([a-z]+).stackexchange.com/;
const STACKEXCHANGE_VALID_PATHNAMES = /(^\/questions|\/posts\/\d+\/edit|^\/review)/u;

export default class Extension {
  constructor() {
    this._storage = new Storage();
  }

  async init() {
    await this._storage.init();
    this._bindListeners();
  }

  _bindListeners() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.action !== "runPrettierFormat") {
        return;
      }
      const inputEl = document.activeElement;
      if (!inputEl?.tagName === "TEXTAREA") {
        return;
      }
      this._format(inputEl);
      return Promise.resolve("Formatting complete!");
    });
  }

  _isStackOverflow() {
    const origin = window.location.origin;

    return (
      (STACKEXCHANGE_SITES.some((url) => url === origin) ||
        STACKEXCHANGE_URL_REGEX.test(origin)) &&
      STACKEXCHANGE_VALID_PATHNAMES.test(window.location.pathname)
    );
  }

  _format(inputEl) {
    const options = this._storage.get().prettierOptions;
    const inputValue = inputEl.value;
    const formattedValue = this._isStackOverflow()
      ? this._formatStackOverflow(inputValue, options)
      : this._formatDefault(inputValue, options);
    inputEl.value = formattedValue;
    inputEl.focus();
  }

  _formatDefault(inputValue) {
    return prettier.format(inputValue, {
      parser: "markdown",
      plugins: PARSERS,
      ...this._storage.get().prettierOptions,
    });
  }

  // https://stackoverflow.com/editing-help#code
  _formatStackOverflow(inputValue) {
    let isInBlock = false;
    const codeBlocks = inputValue.split("\n").reduce((groups, line) => {
      const codeBlockRegex = /^\s{0,3}(?:```|~~~)/u;
      const indentedCodeLangRegex = /^\s*<!-- language: lang-.* -->/u;
      const langAllRegex = /^\s*<!-- language-all: lang-.+ -->/u;
      const emptyLineRegex = /^\s*$/u;
      const indentedCodeBlockRegex = /^\s{4}/u;
      const codeSnippetRegex = /`{1,2}[^\n`]+`{1,2}/u;
      const lastGroup = groups[groups.length - 1];

      /*
       * Code blocks using backicks or tildes:
       *
       * ```lang-js
       * const foo = 'bar';
       * ```
       *
       * ~~~lang-js
       * const foo = 'bar';
       * ~~~
       */
      if (codeBlockRegex.test(line)) {
        if (isInBlock) {
          lastGroup.push(line);
          isInBlock = false;
        } else {
          groups.push([line]);
          isInBlock = true;
        }
      } else if (isInBlock) {
        lastGroup.push(line);

        /*
         * Code snippet using backicks:
         *
         * `const foo = 'bar';`
         *
         * ``const foo = `${bar}`;``
         */
      } else if (codeSnippetRegex.test(line)) {
        groups.push([line]);

        /*
         * Code blocks using indented lines:
         *
         *     const foo = 'bar';
         *     console.log(typeof foo);
         *
         * <!-- language: lang-js -->
         *
         *     const foo = 'bar';
         *     console.log(typeof foo);
         */
      } else if (emptyLineRegex.test(line)) {
        if (
          lastGroup &&
          indentedCodeLangRegex.test(lastGroup[lastGroup.length - 1])
        ) {
          lastGroup.push(line);
        }
      } else if (indentedCodeLangRegex.test(line)) {
        groups.push([line]);
      } else if (indentedCodeBlockRegex.test(line)) {
        if (
          lastGroup &&
          (indentedCodeBlockRegex.test(lastGroup[lastGroup.length - 1]) ||
            emptyLineRegex.test(lastGroup[lastGroup.length - 1]))
        ) {
          lastGroup.push(line);
        } else {
          groups.push([line]);
        }
        /*
         * language-all comments:
         *
         * <!-- language-all: lang-js -->
         */
      } else if (langAllRegex.test(line)) {
        groups.push([line]);
      }

      return groups;
    }, []);

    // There is an unclosed code block.
    if (isInBlock) {
      return;
    }

    if (codeBlocks.length) {
      let langAll = null;

      // https://stackoverflow.com/editing-help#syntax-highlighting
      codeBlocks.forEach((lines) => {
        const codeBlockRegex = /^\s{0,3}(?:```|~~~)\s*(?:lang-(.+))?/u;
        const indentedCodeWithLangRegex = /^\s*<!-- language: lang-(.+) -->/u;
        const langAllRegex = /^\s*<!-- language-all: lang-(.+) -->/u;
        const codeSnippetRegex = /(`{1,2})([^\n`]+)(`{1,2})/gu;
        const [firstLine] = lines;

        if (langAllRegex.test(firstLine)) {
          [, langAll = null] = firstLine.match(langAllRegex);
          return;
        }

        const [, lang = langAll] =
          firstLine.match(codeBlockRegex) ||
          firstLine.match(indentedCodeWithLangRegex) ||
          [];

        if (!lang) {
          return;
        }

        let formattedText = lines.join("\n");

        // Code Snippets
        if (codeSnippetRegex.test(firstLine)) {
          formattedText = firstLine.replace(
            codeSnippetRegex,
            (match, openingBackticks, snippet, closingBackticks) => {
              let formattedSnippet = snippet;

              try {
                formattedSnippet = prettier.format(snippet, {
                  parser: PARSERS_LANG_MAP[lang],
                  plugins: PARSERS,
                  ...this._storage.get().prettierOptions,
                });
              } catch {}

              return `${openingBackticks}${formattedSnippet}${closingBackticks}`;
            }
          );

          // Code Blocks
        } else {
          const isCodeBlock = codeBlockRegex.test(firstLine);
          const isIndentedBlockWithLang = indentedCodeWithLangRegex.test(
            firstLine
          );
          let codeLines;

          if (isCodeBlock) {
            codeLines = lines.slice(1, -1);
          } else {
            const indentedLineCodeBlockStartIdx = 2;
            codeLines = isIndentedBlockWithLang
              ? lines.slice(indentedLineCodeBlockStartIdx)
              : lines;
          }

          try {
            formattedText = prettier.format(codeLines.join("\n"), {
              parser: PARSERS_LANG_MAP[lang],
              plugins: PARSERS,
              ...this._storage.get().prettierOptions,
            });
          } catch {
            return;
          }

          if (isCodeBlock) {
            formattedText = `${firstLine}\n${formattedText}\n${
              lines[lines.length - 1]
            }`;
          } else {
            const langComment = isIndentedBlockWithLang
              ? `${firstLine}\n${lines[1]}\n`
              : "";
            formattedText = `${langComment}    ${
              formattedText.split("\n").length > 1
                ? formattedText.split("\n").join("\n    ")
                : formattedText
            }`;
          }
        }

        return inputValue.replace(lines.join("\n"), formattedText);
      });
    }

    return prettier.format(inputValue, {
      parser: "markdown",
      plugins: PARSERS,
      ...this._storage.get().prettierOptions,
    });
  }
}
