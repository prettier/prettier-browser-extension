import PropTypes from "prop-types";
import React from "react";

// Form based on https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/app/pages/common/Modals/PreferencesModal/CodeFormatting/Prettier/index.tsx
export default function VisualConfig({ options, handleOptionsChange }) {
  return (
    <>
      <hr />
      <label>
        Print width
        <input
          type="number"
          name="printWidth"
          value={options.printWidth}
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
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
          onChange={handleOptionsChange}
        >
          <option>avoid</option>
          <option>always</option>
        </select>
      </label>
      <p>Include parentheses around a sole arrow function parameter.</p>
    </>
  );
}

VisualConfig.propTypes = {
  handleOptionsChange: PropTypes.func,
  options: PropTypes.object
};
