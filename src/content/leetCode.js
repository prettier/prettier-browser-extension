import { PARSERS, PARSERS_LANG_MAP } from "./parsers";
import prettier from "prettier/standalone";
import renderButton from "./button";

const LEETCODE_URL = "https://leetcode.com";
const LEETCODE_VALID_PATHNAMES = /(^\/problems)/u;

export default class LeetCode {
  constructor(storage) {
    this._storage = storage;
    this._init();
  }

  static test() {
    return (
      window.location.origin === LEETCODE_URL &&
      LEETCODE_VALID_PATHNAMES.test(window.location.pathname)
    );
  }

  _init() {
    this._addClientListeners();

    this._handleChange();
    const pageObserver = new MutationObserver(() => this._handleChange());
    pageObserver.observe(document.querySelector("body"), {
      childList: true,
      subtree: true,
    });

    this._addExtensionListener();
  }

  _addClientListeners() {
    const scriptContent = () => {
      document.addEventListener("GetEditorContent", () => {
        const editor = document.querySelector(".CodeMirror");
        if (editor) {
          const content = editor.CodeMirror.doc.getValue();
          document.dispatchEvent(
            new CustomEvent("FormatEditorContent", { detail: content })
          );
        } else {
          console.error("No editor found");
        }
      });

      document.addEventListener("SetEditorContent", (event) => {
        const editor = document.querySelector(".CodeMirror");
        if (editor) {
          editor.CodeMirror.doc.setValue(event.detail);
        } else {
          console.error("No editor found");
        }
      });
    };

    // Executing scriptContent in the page context through an injected script tag
    const script = document.createElement("script");
    script.textContent = `(${scriptContent})()`;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  _handleChange() {
    const languageEl = document.querySelector('[data-cy="lang-select"]');
    if (!languageEl) {
      return;
    }

    if (languageEl.innerText !== "JavaScript") {
      this._removeButton();
    } else {
      this._createButton();
    }
  }

  _createButton() {
    const buttonRowEl = document.querySelector('[class^="btns"]');
    if (!buttonRowEl) {
      return;
    }

    for (const childElem of buttonRowEl.childNodes) {
      if (Array.from(childElem.classList).includes("prettier-btn")) {
        return;
      }
    }

    // Using styles from existing language select element
    const selectEl = document.querySelector('[data-cy="lang-select"]')
      .parentElement;
    const selectClasses = [...selectEl.classList];

    renderButton(buttonRowEl, {
      classes: ["prettier-btn", ...selectClasses],
      style: {
        cursor: "pointer",
        margin: "0 10px",
        padding: "0 10px",
      },
    }).addEventListener("click", (event) => {
      event.preventDefault();

      // Initiating format event chain
      document.dispatchEvent(new Event("GetEditorContent"));
    });
  }

  _removeButton() {
    const button = document.querySelector(".prettier-btn");
    if (button) {
      button.remove();
    }
  }

  _addExtensionListener() {
    document.addEventListener("FormatEditorContent", (event) => {
      const snippet = event.detail;

      const formattedSnippet = prettier.format(snippet, {
        parser: PARSERS_LANG_MAP.js,
        plugins: PARSERS,
        ...this._getOptions(),
      });

      document.dispatchEvent(
        new CustomEvent("SetEditorContent", { detail: formattedSnippet })
      );
    });
  }

  _getOptions() {
    return this._storage.get().prettierOptions;
  }
}
