import { PARSERS, PARSERS_LANG_MAP } from "./parsers";
import prettier from "prettier/standalone";
import renderButton from "./button";

const STACKEXCHANGE_SITES = [
  "https://stackoverflow.com",
  "https://askubuntu.com",
  "https://mathoverflow.com",
  "https://serverfault.com",
  "https://stackapps.com",
  "https://superuser.com",
];
const STACKEXCHANGE_URL_REGEX = /^https:\/\/([a-z]+).stackexchange.com/;
const STACKEXCHANGE_VALID_PATHNAMES = /(^\/questions|\/posts\/\d+\/edit)/u;

export default class StackOverflow {
  constructor(storage) {
    this._storage = storage;
    this._init();
  }

  static test() {
    const origin = window.location.origin;

    return (
      (STACKEXCHANGE_SITES.some((url) => url === origin) ||
        STACKEXCHANGE_URL_REGEX.test(origin)) &&
      STACKEXCHANGE_VALID_PATHNAMES.test(window.location.pathname)
    );
  }

  _init() {
    this._createButton();
    const pageObserver = new MutationObserver(() => this._createButton());
    const content = document.querySelector("#content");

    if (content) {
      pageObserver.observe(content, {
        childList: true,
        subtree: true,
      });
    }
  }

  _createButton() {
    if (!document.querySelector(".wmd-button-row")) {
      return;
    }

    const inputEl = document.querySelector(".wmd-input");
    const buttonRowEl = document.querySelector(".wmd-button-row");

    for (const childElem of buttonRowEl.childNodes) {
      if (Array.from(childElem.classList).includes("prettier-btn")) {
        return;
      }
    }

    renderButton(buttonRowEl, {
      classes: ["s-btn", "s-btn__primary", "prettier-btn"],
      style: { margin: "6px" },
    }).addEventListener("click", (event) => {
      event.preventDefault();

      // https://stackoverflow.com/editing-help#code
      let isInBlock = false;
      const codeBlocks = inputEl.value.split("\n").reduce((groups, line) => {
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
                    ...this._getOptions(),
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
                ...this._getOptions(),
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

          inputEl.value = inputEl.value.replace(
            lines.join("\n"),
            formattedText
          );
        });
      }

      inputEl.value = prettier.format(inputEl.value, {
        parser: "markdown",
        plugins: PARSERS,
        ...this._getOptions(),
      });
      inputEl.focus();
    });
  }

  _getOptions() {
    return this._storage.get().prettierOptions;
  }
}
