import { findWithClass, isElementVisible } from "./domUtils";
import renderButton, {
  BUTTONS,
  BUTTONS_TO_SEARCH_FOR,
  COMMENT_SIBLING_SELECTORS_TO_DEFER_TO,
} from "./button";
import { PARSERS } from "./parsers";
import prettier from "prettier/standalone";

const GITHUB_URL = "https://github.com";
const GITHUB_VALID_PATHNAMES = /^\/.*\/.*\/(?:pull\/\d+(?:\/?|\/files\/?)$|commits?\/.*|compare\/.*|issues\/\d+|issues|wiki|wiki\/\d+\/(_?new|_edit))/u;
const PR_CONVSERATION_CONTAINER_CLASS = ".js-discussion";
const PR_DIFF_CONTAINER_CLASS = ".js-diff-container";
const COMMIT_DIFF_CONTAINER_CLASS = ".js-details-container";
const NEW_ISSUE_CONTAINER_CLASS = ".timeline-comment-wrapper";
const WIKI_EDITOR_CONTAINER_CLASS = ".gollum-editor .form-actions";
const OBSERVABLE_CONTAINERS = [
  PR_CONVSERATION_CONTAINER_CLASS,
  PR_DIFF_CONTAINER_CLASS,
  COMMIT_DIFF_CONTAINER_CLASS,
  NEW_ISSUE_CONTAINER_CLASS,
  WIKI_EDITOR_CONTAINER_CLASS,
];

export default class GitHub {
  constructor(storage) {
    this._currentUrl = window.location.href;
    this._storage = storage;
    this._urlObserver = null;
    this._domObserver = null;
    this._init();
  }

  static test() {
    return (
      window.location.origin === GITHUB_URL &&
      GITHUB_VALID_PATHNAMES.test(window.location.pathname)
    );
  }

  _init() {
    this._observeURLChanges();

    this._observeDOMChanges();
    this._createButtons();
  }

  _observeURLChanges() {
    if (!this._urlObserver) {
      this._urlObserver = new MutationObserver(() => {
        if (window.location.href === this._currentUrl) {
          return;
        }

        this._currentUrl = window.location.href;
        this._domObserver.disconnect();

        this._init();
      });
    }

    this._urlObserver.observe(document.querySelector("body"), {
      childList: true,
    });
  }

  _observeDOMChanges() {
    if (!this._domObserver) {
      // TODO: filter out mutations in the callback to improve performance.
      this._domObserver = new MutationObserver(() => this._createButtons());
    }

    for (const elem of document.querySelectorAll(
      OBSERVABLE_CONTAINERS.join(",")
    )) {
      this._domObserver.observe(elem, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
  }

  _createButtons() {
    for (const button of this._searchForButtons()) {
      const parentNode = button.parentNode;

      if (
        !isElementVisible(parentNode) ||
        parentNode.querySelector(".prettier-btn")
      ) {
        continue;
      }

      const options = {
        append: true,
        classes: ["prettier-btn"],
        refNode: null,
        style: { "margin-right": "4px" },
      };

      // These two buttons have a unique DOM structure, so we need
      // to render the button relative to the left-most button.
      if (
        button.innerText === BUTTONS.SUBMIT_NEW_ISSUE ||
        button.innerText === BUTTONS.CREATE_PULL_REQUEST
      ) {
        options.refNode = button;
      }

      // The Create pull request button has `float: left;`,
      // causing issues with the flow of the button row.
      if (button.innerText === BUTTONS.CREATE_PULL_REQUEST) {
        options.style = { ...options.style, float: "left" };
      }

      const prettierButton = renderButton(parentNode, options);
      const inputEl = findWithClass(prettierButton, "comment-form-textarea");

      prettierButton.addEventListener("click", (event) => {
        event.preventDefault();
        inputEl.value = prettier.format(inputEl.value, {
          parser: "markdown",
          plugins: PARSERS,
          ...this._storage.get().prettierOptions,
        });
        inputEl.focus();
      });
    }
  }

  _searchForButtons() {
    const buttons = [];

    for (const button of document.getElementsByTagName("button")) {
      if (BUTTONS_TO_SEARCH_FOR.includes(button.innerText)) {
        if (
          // Skip Comment buttons that aren't the leftmost button.
          (button.innerText === BUTTONS.COMMENT &&
            COMMENT_SIBLING_SELECTORS_TO_DEFER_TO.some(
              (sel) => !!button.parentNode.parentNode.querySelector(sel)
            )) ||
          // Skip issue title edit buttons
          button.parentNode.parentNode.classList.contains("js-issue-update")
        ) {
          continue;
        }

        buttons.push(button);
      }
    }

    return buttons;
  }
}
