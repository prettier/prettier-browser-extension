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
    css: "postcss",
    flow: "flow",
    html: "html",
    javascript: "babel",
    js: "babel",
    json: "babel",
    less: "postcss",
    markdown: "markdown",
    scss: "postcss",
    ts: "typescript",
    typescript: "typescript",
    yaml: "yaml"
  };

  function formatText(event, textAreaElem, text = null, parser = "markdown") {
    if (event) {
      event.preventDefault();
    }
    const textToFormat = text || textAreaElem.value;
    let formattedText;
    if (parser) {
      formattedText = prettier.format(textToFormat, {
        parser,
        plugins: prettierPlugins
      });
    } else {
      formattedText = textToFormat;
    }

    textAreaElem.focus();
    textAreaElem.select();
    document.execCommand("delete", false, null);
    document.execCommand("insertText", false, `${formattedText}`);
    return formattedText;
  }

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
      if (button.parentNode.querySelector(".prettier-btn") === null) {
        const buttonElem = renderButton(button.parentNode, {
          append: true,
          classes: ["prettier-btn"],
          refNode: button,
          style: BUTTON_STYLE
        });
        const textArea = findWithClass(buttonElem, "comment-form-textarea");
        buttonElem.addEventListener("click", event =>
          formatText(event, textArea)
        );
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

  function initGitHubButton() {
    if (GITHUB_VALID_PATHNAMES.test(window.location.pathname)) {
      createGithubPrettierButtons();
    }
  }

  function resetGithubCommentObserver(observer) {
    for (const elem of document.querySelectorAll(".timeline-comment-group")) {
      observer.observe(elem, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
  }

  function resetGithubNewCommentObserver(observer) {
    const content = document.querySelector(".js-disscussion");
    if (content) {
      observer.disconnect();
      observer.observe(content, { childList: true });
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

  // Pasting events are used to force stackoverflows WMD to save state.
  // TODO: This solution is buggy and does not always work - more discussion needed on solution
  function stackOverflowFormat(event, inputEl) {
    event.preventDefault();
    const codeBlocks = getCodeBlocksStackOverflow(inputEl);

    let markdownText = inputEl.value;
    const formattedText = [];
    if (codeBlocks.length) {
      /*
       * TODO: Add support for language-all: <!-- language-all: lang-* -->
       * Once this support is added, we can format inline code snippets (i.e. `const foo = 'bar';`).
       * https://stackoverflow.com/editing-help#syntax-highlighting
       */

      codeBlocks.forEach(block => {
        const arrToAdd = [];
        if (block.content.length) {
          arrToAdd.push(
            prettier.format(block.content.join("\n"), {
              parser: PARSERS_LANG_MAP[block.parser],
              plugins: prettierPlugins
            })
          );
        }
        if (block.codeBlock) {
          arrToAdd.unshift(block.firstLine);
          if (block.lastLine) {
            arrToAdd.push(block.lastLine);
          }
        }
        formattedText.push(...arrToAdd);
      });
    } else {
      markdownText = prettier.format(inputEl.value, {
        parser: "markdown",
        plugins: prettierPlugins
      });
    }
    let textToUpdateTo = markdownText;
    if (formattedText.length) {
      textToUpdateTo = formattedText.join("\n");
    }

    inputEl.dispatchEvent(new Event("paste"));
    inputEl.value = formatText(event, inputEl, textToUpdateTo, null);
    inputEl.dispatchEvent(new Event("paste"));
  }

  function getCodeBlocksStackOverflow(inputEl) {
    const lines = inputEl.value.split("\n");
    const emptyStringRegex = /^\s*$/u;
    const codeBlockRegex = /^\s{0,3}(?:```|~~~)lang-(.*)/u;
    const codeBlockRegexClose = /^\s{0,3}(?:```|~~~)/u;
    const indentedCodeLangRegex = /^\s*<!-- language: lang-(.*) -->/u;
    const indentedCodeBlockRegex = /^\s{4}/u;

    function getLangNameFromMatch(match) {
      if (match !== null) {
        const GROUP_INDEX_LANG_NAME = 1;
        return match[GROUP_INDEX_LANG_NAME];
      }
      return null;
    }

    function getCodeBlock(line) {
      const matchObj = line.match(codeBlockRegex);
      return getLangNameFromMatch(matchObj);
    }

    function getIndentedCodeBlock(line) {
      const matchObj = line.match(indentedCodeLangRegex);
      return getLangNameFromMatch(matchObj);
    }

    let outsideOfBlocks = [];
    let inCodeBlock = false;
    let inIndentedBlock = false;
    let currentLang = "markdown";
    let currentBlock = [];
    const allBlocks = [];

    function clearCurrentBlock(outsideOfBlock = false, langOverride = null) {
      const parser = langOverride || currentLang;
      if (currentBlock.length) {
        const firstLine = currentBlock[0];
        let lastLine = null;
        if (currentBlock.length > 1) {
          lastLine = currentBlock[currentBlock.length - 1];
        }
        if (inCodeBlock || inIndentedBlock) {
          currentBlock = currentBlock.slice(1, currentBlock.length - 1);
        }

        allBlocks.push({
          codeBlock: inCodeBlock || inIndentedBlock,
          content: currentBlock,
          firstLine,
          lastLine,
          parser
        });
      }
      currentBlock = [];
      outsideOfBlocks = [];
      if (outsideOfBlock) {
        inCodeBlock = false;
        inIndentedBlock = false;
      }
    }

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      if (emptyStringRegex.test(line)) {
        continue;
      }

      const langIndented = getIndentedCodeBlock(line);
      const codeBlock = getCodeBlock(line);
      const lang = codeBlock || langIndented;

      if (lang) {
        if (outsideOfBlocks.length) {
          currentBlock = outsideOfBlocks;
          clearCurrentBlock(false, "markdown");
        }
        if (inCodeBlock || inIndentedBlock) {
          clearCurrentBlock();
        }
        currentLang = lang;

        if (langIndented) {
          inIndentedBlock = true;
          inCodeBlock = false;
        } else if (codeBlock) {
          inCodeBlock = true;
          inIndentedBlock = false;
        }
        currentBlock.push(line);
      } else if (inCodeBlock || inIndentedBlock) {
        if (inIndentedBlock) {
          if (indentedCodeBlockRegex.test(line)) {
            currentBlock.push(line);
          } else {
            clearCurrentBlock(true);
            idx -= 1;
          }
        }

        if (inCodeBlock) {
          if (codeBlockRegexClose.test(line)) {
            currentBlock.push(line);
            clearCurrentBlock(true);
          } else {
            currentBlock.push(line);
          }
        }
      } else {
        outsideOfBlocks.push(line);
      }
    }

    if (outsideOfBlocks.length) {
      currentLang = "markdown";
      currentBlock = outsideOfBlocks;
    }
    clearCurrentBlock(true);

    return allBlocks;
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
    buttonEl.addEventListener("click", event =>
      stackOverflowFormat(event, inputEl)
    );
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

init();
