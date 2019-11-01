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
import prettier from "prettier/standalone";

let storageCache = {};

function updateStorageCache() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(data => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      }

      storageCache = { ...data };
      resolve();
    });
  });
}

function init() {
  const prettierPlugins = [
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

  const GITHUB_URL = "https://github.com";
  const GITHUB_VALID_PATHNAMES = /^\/.*\/.*\/(?:pull\/\d+(?:\/?|\/files\/?)$|commit|compare\/.*|issues\/\d+|issues\/new)/u;
  let isGithubListenerAdded = false;

  const STACKOVERFLOW_URL = "https://stackoverflow.com";
  const STACKOVERFLOW_VALID_PATHNAMES = /(^\/questions|\/posts\/\d+\/edit)/u;
  const PARSERS_LANG_MAP = {
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

  function renderButton(
    el,
    { classes = [], style = {}, append = true, refNode = null } = {}
  ) {
    const button = document.createElement("button");
    button.textContent = "Prettier";
    button.type = "button";
    button.classList.add("btn", ...classes);

    for (const [key, value] of Object.entries(style)) {
      button.style[key] = value;
    }

    if (refNode) {
      el.insertBefore(button, refNode);
    } else if (append) {
      el.append(button);
    } else {
      el.prepend(button);
    }

    return button;
  }

  function seachForGithubButtons() {
    const COMMENT = "Comment";
    const REPLY = "Reply…";
    const CANCEL = "Cancel";
    const CLOSE_ISSUE = " Close issue";
    const CLOSE_PULL_REQUEST = " Close pull request";
    const SUBMIT_PULL_REQUEST = "Create pull request";
    const SUBMIT_NEW_ISSUE = "Submit new issue";
    const BUTTONS_TO_SEARCH_FOR = [
      COMMENT,
      CANCEL,
      CLOSE_ISSUE,
      CLOSE_PULL_REQUEST,
      SUBMIT_PULL_REQUEST,
      SUBMIT_NEW_ISSUE
    ];

    const buttons = document.getElementsByTagName("button");
    const createList = [];
    for (const button of buttons) {
      if (BUTTONS_TO_SEARCH_FOR.includes(button.innerText)) {
        if (
          button.innerText === COMMENT &&
          (button.parentNode.parentNode.querySelector(
            "button[name=comment_and_close]"
          ) ||
            button.parentNode.parentNode.querySelector(
              "button[data-confirm-cancel-text]"
            ))
        ) {
          continue;
        }
        createList.push(button);
      }
      if (button.innerText === REPLY) {
        const observer = new MutationObserver(() => {
          createGithubPrettierButtons();
        });
        observer.observe(
          findWithClass(button, "inline-comment-form-container"),
          { attributes: true }
        );
      }
    }
    return createList;
  }

  function createGithubPrettierButtons() {
    const BUTTON_STYLE = { float: "left", "margin-right": "10px" };
    const createList = seachForGithubButtons();

    for (const button of createList) {
      let prettierBtn = button.parentNode.querySelector(".prettier-btn");
      if (prettierBtn === null) {
        prettierBtn = renderButton(button.parentNode, {
          append: true,
          classes: ["prettier-btn"],
          refNode: button,
          style: BUTTON_STYLE
        });
      }

      const textArea = findWithClass(prettierBtn, "comment-form-textarea");
      prettierBtn.addEventListener("click", event => {
        event.preventDefault();
        const formattedText = prettier.format(textArea.value, {
          parser: "markdown",
          plugins: prettierPlugins,
          ...storageCache.options
        });
        textArea.focus();
        textArea.select();
        document.execCommand("delete", false, null);
        document.execCommand("insertText", false, formattedText);
      });
    }
  }

  function findWithClass(buttonElement, classToFind) {
    const alreadySeen = [];
    const alreadyAdded = [];
    const childrenNodes = [buttonElement];

    while (childrenNodes.length > 0) {
      const thisChild = childrenNodes.pop();
      const classList = thisChild.classList
        ? Array.from(thisChild.classList)
        : [];

      if (
        thisChild.tagName &&
        !classList.includes(classToFind) &&
        !alreadySeen.includes(thisChild)
      ) {
        if (!alreadyAdded.includes(thisChild.parentNode)) {
          childrenNodes.push(thisChild.parentNode);
          alreadyAdded.push(thisChild.parentNode);
        }
        alreadySeen.push(thisChild);
        childrenNodes.push(...thisChild.childNodes);
      }

      if (classList.includes(classToFind)) {
        return thisChild;
      }
    }

    return null;
  }

  function initGitHubButton() {
    if (GITHUB_VALID_PATHNAMES.test(window.location.pathname)) {
      createGithubPrettierButtons();
    }
  }

  function resetGithubNewCommentObserver(observer) {
    const content = document.querySelector(".js-discussion");
    if (content) {
      observer.disconnect();
      observer.observe(content, { childList: true, subtree: true });
    }
  }

  function resetGithubCommentObserver(observer) {
    const JS_DIFF_CONTAINER_CLASS = ".js-diff-progressive-container";
    const COMMENT_TIMELINE_GROUP_CLASS = ".timeline-comment-group";

    for (const elem of document.querySelectorAll(
      COMMENT_TIMELINE_GROUP_CLASS
    )) {
      observer.observe(elem, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }

    for (const elem of document.querySelectorAll(JS_DIFF_CONTAINER_CLASS)) {
      observer.observe(elem, {
        childList: true,
        subtree: true
      });
    }
  }

  if (window.location.origin === GITHUB_URL) {
    let currentPath = window.location.pathname;
    if (!isGithubListenerAdded) {
      const commentObserver = new MutationObserver(() => {
        initGitHubButton();
      });
      const newCommentObserver = new MutationObserver(() => {
        commentObserver.disconnect();
        resetGithubCommentObserver(commentObserver);
        initGitHubButton();
      });
      const pageObserver = new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname;
          initGitHubButton();

          commentObserver.disconnect();
          resetGithubCommentObserver(commentObserver);
          resetGithubNewCommentObserver(newCommentObserver);
        }
      });
      pageObserver.observe(document.querySelector("body"), {
        childList: true
      });

      resetGithubCommentObserver(commentObserver);
      resetGithubNewCommentObserver(newCommentObserver);
      isGithubListenerAdded = true;
    }
    initGitHubButton();
  }

  function renderStackOverflowButton() {
    const inputEl = document.querySelector(".wmd-input");
    const buttonRowEl = document.querySelector(".wmd-button-row");

    for (const childElem of buttonRowEl.childNodes) {
      if (Array.from(childElem.classList).includes("prettier-btn")) {
        return;
      }
    }

    const buttonEl = renderButton(buttonRowEl, {
      classes: ["s-btn", "s-btn__primary", "prettier-btn"],
      style: { margin: "6px" }
    });
    buttonEl.addEventListener("click", event => {
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
        codeBlocks.forEach(lines => {
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
                    plugins: prettierPlugins,
                    ...storageCache.options
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
                plugins: prettierPlugins,
                ...storageCache.options
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
        plugins: prettierPlugins,
        ...storageCache.options
      });
      inputEl.focus();
    });
  }

  function initStackOverflowButton() {
    const buttonRow = document.querySelector(".wmd-button-row");
    if (buttonRow) {
      renderStackOverflowButton();
    }
  }

  if (
    window.location.origin === STACKOVERFLOW_URL &&
    STACKOVERFLOW_VALID_PATHNAMES.test(window.location.pathname)
  ) {
    initStackOverflowButton();

    const pageObserver = new MutationObserver(() => {
      initStackOverflowButton();
    });

    const content = document.querySelector("#content");
    if (content) {
      pageObserver.observe(content, {
        childList: true,
        subtree: true
      });
    }
  }
}

updateStorageCache().then(init);
chrome.storage.onChanged.addListener(updateStorageCache);
