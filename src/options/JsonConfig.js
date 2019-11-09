import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import defaultOptions from "./defaultOptions";
import parserBabylon from "prettier/parser-babylon";
import prettier from "prettier/standalone";

const SAVED_TIMEOUT = 500;

export default function JsonConfig({ error, options, setError, setOptions }) {
  const textareaEl = useRef(null);
  const [textAreaVal, setTextAreaVal] = useState(JSON.stringify(options));
  const [displaySaved, setDisplaySaved] = useState(false);

  function handleChange({ target: { value } }) {
    setTextAreaVal(value);
  }

  function displaySavedConfirmation() {
    setDisplaySaved(true);
    window.setTimeout(() => {
      setDisplaySaved(false);
    }, SAVED_TIMEOUT);
  }

  function handleClick() {
    textareaEl.current.focus();

    try {
      let parsedOptions;

      try {
        parsedOptions = JSON.parse(textAreaVal);
      } catch {
        throw new Error("Invalid JSON");
      }

      for (const key of Object.keys(parsedOptions)) {
        if (defaultOptions.prettierOptions[key] !== undefined) {
          continue;
        }

        throw new Error(`${key} is an invalid option`);
      }
      setOptions(parsedOptions);
      setError("");
      displaySavedConfirmation();
    } catch (err) {
      setError(err.message);
    }
  }

  let formattedOptions = textAreaVal;

  try {
    formattedOptions = prettier.format(textAreaVal, {
      parser: "json",
      plugins: [parserBabylon],
      ...options
    });
  } catch {}

  return (
    <>
      <hr />
      {error.length > 0 && <p>Error: {error}</p>}
      {displaySaved && <p>Saved</p>}
      <textarea
        value={formattedOptions}
        columns={80}
        rows={24}
        ref={textareaEl}
        onChange={handleChange}
      />
      <button onClick={handleClick}>Save</button>
    </>
  );
}

JsonConfig.propTypes = {
  error: PropTypes.string,
  options: PropTypes.object,
  setError: PropTypes.func,
  setOptions: PropTypes.func
};
