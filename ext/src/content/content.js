"use strict";

function init() {
  const GITHUB_URL = "https://github.com";
  const GITHUB_VALID_PATHNAMES = /^\/.*\/.*\/(?:pull\/\d+(?:\/?|\/files\/?)$|commit|compare\/.*|issues\/\d+|issues\/new)/u;
  let isGithubListenerAdded = false;

  const STACKOVERFLOW_URL = "https://stackoverflow.com";
  const STACKOVERFLOW_VALID_PATHNAMES = /^\/questions/u;
  const PARSERS_LANG_MAP = {
    css: "postcss",
    flow: "flow",
    html: "html",
    javascript: "babel",
    js: "babel",
    json: "babel",
    less: "postcss",
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

  function setupCommentObserver(observer) {
    for (const elem of document.querySelectorAll(".timeline-comment-group")) {
      observer.observe(elem, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
  }

  function searchAndAddListenerToButtons() {
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
          discoverButtonsAndCreatePrettierButtons();
        });
        observer.observe(
          findWithClass(button, "inline-comment-form-container"),
          { attributes: true }
        );
      }
    }
    return createList;
  }

  function discoverButtonsAndCreatePrettierButtons() {
    const BUTTON_STYLE = { float: "left", "margin-right": "10px" };
    const createList = searchAndAddListenerToButtons();

    for (const button of createList) {
      if (button.parentNode.querySelector(".prettier-btn") === null) {
        const buttonElem = renderButton(button.parentNode, {
          append: true,
          classes: ["prettier-btn"],
          refNode: button,
          style: BUTTON_STYLE
        });
        const textArea = findWithClass(buttonElem, "comment-form-textarea");
        buttonElem.addEventListener("click", event => {
          event.preventDefault();
          const formattedText = window.prettier.format(textArea.value, {
            parser: "markdown",
            plugins: window.prettierPlugins
          });
          textArea.focus();
          textArea.select();
          document.execCommand("delete", false, null);
          document.execCommand("insertText", false, formattedText);
        });
      }
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

  /*
   * GitHub has three different views with editable comments:
   *
   * 1. Pull request conversation view
   * 2. Pull request diff view
   * 3. Issues
   */
  function initGitHubButton() {
    if (GITHUB_VALID_PATHNAMES.test(window.location.pathname)) {
      discoverButtonsAndCreatePrettierButtons();
    }
  }

  function initStackOverflowButton() {
    function renderStackOverflowButton() {
      const inputEl = document.querySelector("#wmd-input");
      const buttonRowEl = document.querySelector(".wmd-button-row");
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
            groups.push(line);

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
          }

          return groups;
        }, []);

        // There is an unclosed code block.
        if (isInBlock) {
          return;
        }

        if (codeBlocks.length) {
          /*
           * TODO: Add support for language-all: <!-- language-all: lang-* -->
           * Once this support is added, we can format inline code snippets (i.e. `const foo = 'bar';`).
           * https://stackoverflow.com/editing-help#syntax-highlighting
           */
          codeBlocks.forEach(lines => {
            const codeBlockRegex = /^\s{0,3}(?:```|~~~)\s*lang-(.+)/u;
            const indentedCodeRegex = /^\s*<!-- language: lang-(.+) -->/u;
            const [firstLine] = lines;
            const [, lang = null] =
              firstLine.match(codeBlockRegex) ||
              firstLine.match(indentedCodeRegex) ||
              [];

            if (!lang) {
              return;
            }

            const isCodeBlock = codeBlockRegex.test(firstLine);
            const indentedLineCodeBlockStartIdx = 2;
            const codeLines = isCodeBlock
              ? lines.slice(1, -1)
              : lines.slice(indentedLineCodeBlockStartIdx);
            let formattedBlock = window.prettier.format(codeLines.join("\n"), {
              parser: PARSERS_LANG_MAP[lang],
              plugins: window.prettierPlugins
            });

            // Prettier adds a trailing newline
            if (codeLines.length !== formattedBlock.split("\n").length) {
              formattedBlock = formattedBlock.replace(/\n$/u, "");
            }

            formattedBlock = isCodeBlock
              ? `${firstLine}\n${formattedBlock}\n${lines[lines.length - 1]}`
              : `${firstLine}\n${lines[1]}\n    ${
                  formattedBlock.split("\n").length > 1
                    ? formattedBlock.split("\n").join("\n    ")
                    : formattedBlock
                }`;

            inputEl.value = inputEl.value.replace(
              lines.join("\n"),
              formattedBlock
            );
          });
        }

        inputEl.value = window.prettier.format(inputEl.value, {
          parser: "markdown",
          plugins: window.prettierPlugins
        });
        inputEl.focus();
      });
    }

    const buttonRowHasLoadedCheckInterval = window.setInterval(() => {
      if (document.querySelector(".wmd-button-row")) {
        window.clearInterval(buttonRowHasLoadedCheckInterval);
        renderStackOverflowButton();
      }
    }, POLLING_INTERVAL);
  }

  if (window.location.origin === GITHUB_URL) {
    let currentPath = window.location.pathname;
    if (!isGithubListenerAdded) {
      const commentObserver = new MutationObserver(() => {
        initGitHubButton();
      });
      const newCommentObserver = new MutationObserver(() => {
        commentObserver.disconnect();
        setupCommentObserver(commentObserver);
      });
      const pageObserver = new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname;
          initGitHubButton();

          commentObserver.disconnect();
          setupCommentObserver(commentObserver);
          const content = document.querySelector(".js-disscussion");
          if (content) {
            newCommentObserver.disconnect();
            newCommentObserver.observe(content, { childList: true });
          }
        }
      });
      pageObserver.observe(document.querySelector("body"), {
        childList: true
      });
      const jsDiscussion = document.querySelector(".js-discussion");
      if (jsDiscussion) {
        newCommentObserver.observe(jsDiscussion, {
          childList: true
        });
      }
      setupCommentObserver(commentObserver);
      isGithubListenerAdded = true;
    }
    initGitHubButton();
  }

  if (
    window.location.origin === STACKOVERFLOW_URL &&
    STACKOVERFLOW_VALID_PATHNAMES.test(window.location.pathname)
  ) {
    initStackOverflowButton();
  }
}

init();
