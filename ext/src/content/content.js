window.onload = function onload() {
  const GITHUB_URL = "https://github.com";
  const STACKOVERFLOW_URL = "https://stackoverflow.com";

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

  function initGitHubBtn() {
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

  function initStackOverflowBtn() {
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

        let isInBlock = false;
        const codeBlocks = inputEl.value.split("\n").reduce((groups, line) => {
          const codeBlockRegex = /^\s{0,3}(?:```|~~~)/u;
          const indentedCodeLangRegex = /^\s*<!-- language: lang-.* -->/u;
          const emptyLineRegex = /^\s*$/u;
          const indentedCodeBlockRegex = /^\s{4}/u;
          const codeSnippetRegex = /(`[^\n`]+`)/u;
          const lastGroup = groups[groups.length - 1];

          let match;
          if (line.match(codeBlockRegex)) {
            if (isInBlock) {
              lastGroup.push(line);
              isInBlock = false;
            } else {
              groups.push([line]);
              isInBlock = true;
            }
          } else if (isInBlock) {
            lastGroup.push(line);
          } else if ((match = line.match(codeSnippetRegex))) {
            groups.push([match[1]]);
          } else if (line.match(emptyLineRegex)) {
            if (
              lastGroup &&
              lastGroup[lastGroup.length - 1].match(indentedCodeLangRegex)
            ) {
              lastGroup.push(line);
            }
          } else if (line.match(indentedCodeLangRegex)) {
            groups.push([line]);
          } else if (line.match(indentedCodeBlockRegex)) {
            if (
              lastGroup &&
              (lastGroup[lastGroup.length - 1].match(indentedCodeBlockRegex) ||
                lastGroup[lastGroup.length - 1].match(emptyLineRegex))
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

        const parsers = {
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

        // TODO: Add support for language: <!-- language-all: lang-* -->
        // https://stackoverflow.com/editing-help#syntax-highlighting
        codeBlocks.forEach(lines => {
          const codeBlockRegex = /^\s{0,3}(?:```|~~~)\s*lang-(.+)/u;
          const indentedCodeRegex = /^\s*<!-- language: lang-(.+) -->/u;
          const [firstLine] = lines;
          const match =
            firstLine.match(codeBlockRegex) ||
            firstLine.match(indentedCodeRegex);
          const [, lang = null] = match || [];

          if (!lang) {
            return;
          }

          const isCodeBlock = codeBlockRegex.test(firstLine);
          const codeLines = isCodeBlock ? lines.slice(1, -1) : lines.slice(2);
          let formattedBlock = window.prettier.format(codeLines.join("\n"), {
            parser: parsers[lang],
            plugins: window.prettierPlugins
          });
          formattedBlock = isCodeBlock
            ? `${firstLine}\n${formattedBlock}\n${lines[lines.length - 1]}`
            : `${firstLine}\n${lines[1]}\n    ${
                formattedBlock.length > 1
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
    initGitHubBtn();
  }

  if (window.location.origin === STACKOVERFLOW_URL) {
    initStackOverflowBtn();
  }
};
