import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const defaultOptions = {
  arrowParens: "avoid",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  useTabs: false
};

function App() {
  const [options, setOptions] = useState();

  useEffect(() => {
    chrome.storage.sync.get(items => {
      setOptions({ ...defaultOptions, ...items.options });
    });
  }, []);

  /*
   * Chrome throws an error when checking for the height of the popup if there aren't
   * any elements on the page. We can use requestAnimationFrame() to ensure
   * that the app's first paint has occurred.
   */
  useEffect(() => {
    const spacerEl = document.querySelector(".chrome-options-spacer");

    if (spacerEl) {
      window.requestAnimationFrame(() => spacerEl.remove());
    }
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({ options });
  }, [options]);

  function handleChange({ target: { checked, name, type, value } }) {
    setOptions({
      ...options,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value)
          : value
    });
  }

  // Form based on https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/app/pages/common/Modals/PreferencesModal/CodeFormatting/Prettier/index.tsx
  return options ? (
    <>
      <h1>
        <a href="https://prettier.io/docs/en/options.html">Prettier Options</a>
      </h1>
      <hr />
      <label>
        Print width
        <input
          type="number"
          name="printWidth"
          value={options.printWidth}
          onChange={handleChange}
        />
      </label>
      <p>Specify the line length that the printer will wrap on.</p>
      <hr />
      <label>
        Tab width
        <input
          type="number"
          name="tabWidth"
          value={options.tabWidth}
          onChange={handleChange}
        />
      </label>
      <p>Specify the number of spaces per indentation-level.</p>
      <hr />
      <label>
        Use tabs
        <input
          type="checkbox"
          name="useTabs"
          checked={options.useTabs}
          onChange={handleChange}
        />
      </label>
      <p>Indent lines with tabs instead of spaces.</p>
      <hr />
      <label>
        Semicolons
        <input
          type="checkbox"
          name="semi"
          checked={options.semi}
          onChange={handleChange}
        />
      </label>
      <p>Print semicolons at the ends of statements.</p>
      <hr />
      <label>
        Use single quotes
        <input
          type="checkbox"
          name="singleQuote"
          checked={options.singleQuote}
          onChange={handleChange}
        />
      </label>
      <p>
        Use {"'"}single{"'"} quotes instead of {'"'}double{'"'} quotes.
      </p>
      <hr />
      <label>
        Trailing commas
        <select
          name="trailingComma"
          value={options.trailingComma}
          onChange={handleChange}
        >
          <option>none</option>
          <option>es5</option>
          <option>all</option>
        </select>
      </label>
      <p>Print trailing commas wherever possible.</p>
      <hr />
      <label>
        Bracket spacing
        <input
          type="checkbox"
          name="bracketSpacing"
          checked={options.bracketSpacing}
          onChange={handleChange}
        />
      </label>
      <p>Print spaces between brackets in object literals.</p>
      <hr />
      <label>
        JSX Brackets
        <input
          type="checkbox"
          name="jsxBracketSameLine"
          checked={options.jsxBracketSameLine}
          onChange={handleChange}
        />
      </label>
      <p>
        Put the `{">"}` of a multi-line JSX element at the end of the last line
        instead of being alone on the next line.
      </p>
      <hr />
      <label>
        Arrow Function Parentheses
        <select
          name="arrowParens"
          value={options.arrowParens}
          onChange={handleChange}
        >
          <option>avoid</option>
          <option>always</option>
        </select>
      </label>
      <p>Include parentheses around a sole arrow function parameter.</p>
    </>
  ) : null;
}

ReactDOM.render(<App />, document.getElementById("root"));
