window.onload = function onload() {
  const GITHUB_URL = "https://github.com";
  const STACKOVERFLOW_URL = "https://stackoverflow.com";

  function getParentWithClass(el, className) {
    let parent = el.parentElement;
    while (!parent.classList.contains(className)) {
      parent = parent.parentElement;
    }
    return parent;
  }

  function renderButton(el, { classes = [], style = {} } = {}) {
    const button = document.createElement("button");
    button.textContent = "Prettify";
    button.classList.add("btn", ...classes);

    for (const [key, value] of Object.entries(style)) {
      button.style[key] = value;
    }

    el.append(button);
    return button;
  }

  function initGitHubBtn() {
    let buttonEl = null;

    function handleGitHubTextareaEvents({ target }) {
      if (!target.classList.contains("comment-form-textarea")) {
        return;
      }

      if (!target.value.length) {
        if (buttonEl) {
          buttonEl.remove();
          buttonEl = null;
        }
        return;
      }

      if (buttonEl) {
        return;
      }

      const parentEl = getParentWithClass(target, "line-comments");
      const actionsEl = parentEl.querySelector(".form-actions");
      buttonEl = renderButton(actionsEl, { classes: ["prettier-btn"] });
      buttonEl.addEventListener("click", e => {
        e.preventDefault();
        target.value = window.prettier.format(target.value, {
          parser: "markdown",
          plugins: window.prettierPlugins
        });
        target.focus();
      });
    }
    const diffTableEl = document.querySelector(".diff-table");
    diffTableEl.addEventListener("select", handleGitHubTextareaEvents);
    diffTableEl.addEventListener("keyup", handleGitHubTextareaEvents);
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
