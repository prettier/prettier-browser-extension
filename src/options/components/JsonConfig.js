import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import parserBabylon from "prettier/parser-babylon";
import prettier from "prettier/standalone";

const PLACEHOLDER_TEXT = `{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true
}`;
const SAVED_TIMEOUT = 500;

export default function JsonConfig({
  config,
  error,
  prettierOptions,
  setError,
  setOption
}) {
  const textareaEl = useRef(null);
  const [textAreaVal, setTextAreaVal] = useState(config);
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
      JSON.parse(textAreaVal);
      setError(false);
      displaySavedConfirmation();
    } catch {
      setError(true);
    } finally {
      let formattedVal;

      try {
        formattedVal = prettier.format(textAreaVal, {
          parser: "json",
          plugins: [parserBabylon],
          ...prettierOptions
        });
        setTextAreaVal(formattedVal);
      } catch {
        formattedVal = textAreaVal;
      }

      setOption("json", "config", formattedVal);
    }
  }

  return (
    <>
      <hr />
      {error && <p>Error: Invalid JSON</p>}
      {displaySaved && <p>Saved</p>}
      <textarea
        name="config"
        value={textAreaVal}
        columns={80}
        rows={24}
        ref={textareaEl}
        placeholder={PLACEHOLDER_TEXT}
        onChange={handleChange}
      />
      <button onClick={handleClick}>Save</button>
    </>
  );
}

JsonConfig.propTypes = {
  config: PropTypes.string,
  error: PropTypes.bool,
  prettierOptions: PropTypes.object,
  setError: PropTypes.func,
  setOption: PropTypes.func
};
