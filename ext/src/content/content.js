window.onload = function onload() {
  const GITHUB_URL = "https://github.com";
  const STACKOVERFLOW_URL = "https://stackoverflow.com";
  const PARSERS_LANG_MAP = {
    javascript: "babel",
    js: "babel",
    json: "babel",
    flow: "flow",
    ts: "typescript",
    typescript: "typescript",
    css: "postcss",
    less: "postcss",
    scss: "postcss",
    html: "html",
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

    append ? el.append(button) : el.prepend(button);

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
    const diffViewEl = document.querySelector(".diff-view");
    const containerEl =
      diffViewEl || document.querySelector(".pull-discussion-timeline");
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

      if (!!diffViewEl) {
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
        style,
        classes: ["prettier-btn"],
        append: !isNewConversationComment
      });
      activeButtons.set(target, buttonEl);
      buttonEl.addEventListener("click", e => {
        e.preventDefault();
        target.value = window.prettier.format(target.value, {
          parser: "markdown",
          plugins: window.prettierPlugins
        });
        target.focus();
      });
    }

    containerEl.addEventListener("select", handleGitHubTextareaEvents);
    containerEl.addEventListener("keyup", handleGitHubTextareaEvents);
  }

  function initStackOverflowButton() {
    let buttonRowEl;
    const buttonRowHasLoadedCheckInterval = setInterval(() => {
      if ((buttonRowEl = document.querySelector(".wmd-button-row"))) {
        clearInterval(buttonRowHasLoadedCheckInterval);
      }

      const inputEl = document.querySelector("#wmd-input");
      const buttonEl = renderButton(buttonRowEl, {
        classes: ["s-btn", "s-btn__primary", "prettier-btn"],
        style: { margin: "6px" }
      });
      buttonEl.addEventListener("click", e => {
        e.preventDefault();

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

        if (!codeBlocks.length || isInBlock) {
          return;
        }

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
          const codeLines = isCodeBlock ? lines.slice(1, -1) : lines.slice(2);
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

        inputEl.value = window.prettier.format(inputEl.value, {
          parser: "markdown",
          plugins: window.prettierPlugins
        });
        inputEl.focus();
      });
    }, 30);
  }

  if (window.location.origin === GITHUB_URL) {
    initGitHubButton();
  }

  if (window.location.origin === STACKOVERFLOW_URL) {
    initStackOverflowButton();
  }
};
