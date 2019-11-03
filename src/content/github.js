import { findWithClass, isElementVisible } from "./utils";
import renderButton, { BUTTONS, BUTTONS_TO_SEARCH_FOR } from "./button";
import { PARSERS } from "./parsers";
import prettier from "prettier/standalone";

const GITHUB_VALID_PATHNAMES = /^\/.*\/.*\/(?:pull\/\d+(?:\/?|\/files\/?)$|commits?\/.*|compare\/.*|issues\/\d+|issues\/new)/u;
const PR_CONVSERATION_CONTAINER_CLASS = ".js-discussion";
const PR_DIFF_CONTAINER_CLASS = ".js-diff-container";
const COMMIT_DIFF_CONTAINER_CLASS = ".js-details-container";
const NEW_ISSUE_CONTAINER_CLASS = ".timeline-comment-wrapper";
const OBSERVABLE_CONTAINERS = [
  PR_CONVSERATION_CONTAINER_CLASS,
  PR_DIFF_CONTAINER_CLASS,
  COMMIT_DIFF_CONTAINER_CLASS,
  NEW_ISSUE_CONTAINER_CLASS
];

export default class GitHub {
  constructor(storage) {
    this._currentUrl = window.location.href;
    this._storage = storage;
    this._urlObserver = null;
    this._domObserver = null;
    this._init();
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

        if (!GITHUB_VALID_PATHNAMES.test(window.location.pathname)) {
          return;
        }

        this._init();
      });
    }

    this._urlObserver.observe(document.querySelector("body"), {
      childList: true
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
        subtree: true
      });
    }
  }

  _createButtons() {
    for (const button of this._seachForGithubButtons()) {
      const parentNode = button.parentNode;

      if (
        !isElementVisible(parentNode) ||
        parentNode.querySelector(".prettier-btn")
      ) {
        continue;
      }

      const prettierButton = renderButton(parentNode, {
        append: true,
        classes: ["prettier-btn"],
        refNode: button.innerText === BUTTONS.SUBMIT_NEW_ISSUE ? button : null,
        style: { "margin-right": "4px" }
      });
      const inputEl = findWithClass(prettierButton, "comment-form-textarea");

      prettierButton.addEventListener("click", event => {
        event.preventDefault();
        inputEl.value = prettier.format(inputEl.value, {
          parser: "markdown",
          plugins: PARSERS,
          ...this._storage.get("options")
        });
        inputEl.focus();
      });
    }
  }

  _seachForGithubButtons() {
    const createList = [];

    for (const button of document.getElementsByTagName("button")) {
      if (BUTTONS_TO_SEARCH_FOR.includes(button.innerText)) {
        if (
          button.innerText === BUTTONS.COMMENT &&
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
    }

    return createList;
  }
}
