"use strict";

function init() {
  const GITHUB_URL = "https://github.com";
  const GITHUB_VALID_PATHNAMES = /^\/.*\/.*\/(?:pull\/\d+(?:\/?|\/files\/?)$|commit|issues\/\d+)/u;
  const STACKOVERFLOW_URL = "https://stackoverflow.com";
  const STACKOVERFLOW_VALID_PATHNAMES = /^\/questions/u;
  const POLLING_INTERVAL = 30;
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

  function getParentWithClass(el, className) {
    let parent = el.parentElement;

    while (!parent.classList.contains(className)) {
      parent = parent.parentElement;

      if (!parent) {
        return null;
      }
    }

    return parent;
  }

  function renderButton(el, { classes = [], style = {}, append = true } = {}) {
    const button = document.createElement("button");
    button.textContent = "Prettier";
    button.classList.add("btn", ...classes);

    for (const [key, value] of Object.entries(style)) {
      button.style[key] = value;
    }

    if (append) {
      el.append(button);
    } else {
      el.prepend(button);
    }

    return button;
  }

  /*
   * GitHub has three different views with editable comments:
   *
   * 1. Pull request conversation view
   * 2. Pull request diff view
   * 3. Issues (still needs to be implemented)
   */
  function initGitHubButton() {
    const DIFF_VIEW_CONTAINER_CLASS = ".diff-view";
    const PR_VIEW_CONTAINER_CLASS = ".pull-discussion-timeline";
    const activeButtons = new Map();

    function handleGitHubTextareaEvents({ target }) {
      if (!target.classList.contains("comment-form-textarea")) {
        return;
      }

      if (!target.value.length) {
        if (activeButtons.has(target)) {
          const buttonEl = activeButtons.get(target);
          buttonEl.remove();
          activeButtons.delete(target);
        }
        return;
      }

      if (activeButtons.has(target)) {
        return;
      }

      let parentEl;
      let buttonsRowSelector;
      let isNewConversationComment = false;

      if (document.querySelector(DIFF_VIEW_CONTAINER_CLASS)) {
        parentEl = getParentWithClass(target, "line-comments");
        buttonsRowSelector = ".form-actions";
      } else {
        const newConversationComment = getParentWithClass(
          target,
          "timeline-new-comment"
        );
        isNewConversationComment = !!newConversationComment;

        if (isNewConversationComment) {
          parentEl = newConversationComment;
          buttonsRowSelector = `#partial-new-comment-form-actions .d-flex`;
        } else {
          parentEl = getParentWithClass(target, "previewable-comment-form");
          buttonsRowSelector = ".form-actions";
        }
      }

      const buttonsRowEl = parentEl.querySelector(buttonsRowSelector);
      const style = isNewConversationComment ? { marginRight: "4px" } : {};
      const buttonEl = renderButton(buttonsRowEl, {
        append: !isNewConversationComment,
        classes: ["prettier-btn"],
        style
      });
      activeButtons.set(target, buttonEl);
      buttonEl.addEventListener("click", event => {
        event.preventDefault();
        target.value = window.prettier.format(target.value, {
          parser: "markdown",
          plugins: window.prettierPlugins
        });
        target.focus();
      });
    }

    const pageHasLoadedCheckInterval = window.setInterval(() => {
      let containerEl;
      if (
        (containerEl =
          document.querySelector(DIFF_VIEW_CONTAINER_CLASS) ||
          document.querySelector(PR_VIEW_CONTAINER_CLASS))
      ) {
        window.clearInterval(pageHasLoadedCheckInterval);
        containerEl.addEventListener("select", handleGitHubTextareaEvents);
        containerEl.addEventListener("keyup", handleGitHubTextareaEvents);
      }
    }, POLLING_INTERVAL);
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

  if (
    window.location.origin === GITHUB_URL &&
    GITHUB_VALID_PATHNAMES.test(window.location.pathname)
  ) {
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
