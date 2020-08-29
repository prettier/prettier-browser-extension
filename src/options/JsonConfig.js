import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import parserBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import { validateOptions } from "./options";

const SAVED_TIMEOUT = 2000;
const STRINGIFY_SPACING = 2;

export default function JsonConfig({ errors, options, setErrors, setOptions }) {
  const textareaEl = useRef(null);
  const [textAreaVal, setTextAreaVal] = useState(
    JSON.stringify(options, null, STRINGIFY_SPACING)
  );
  const [displaySaved, setDisplaySaved] = useState(false);

  useEffect(() => {
    try {
      setTextAreaVal(
        prettier.format(JSON.stringify(options), {
          parser: "json",
          plugins: [parserBabel],
          ...options,
        })
      );
    } catch {}
  }, [options]);

  function handleChange({ target: { value } }) {
    setTextAreaVal(value);
  }

  function handleClick() {
    textareaEl.current.focus();

    let parsedOptions;

    try {
      parsedOptions = JSON.parse(textAreaVal);
    } catch {
      setErrors(["Invalid JSON"]);
      return;
    }

    const validationErrors = validateOptions(parsedOptions);

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setOptions(parsedOptions);
    setErrors([]);
    setDisplaySaved(true);
    window.setTimeout(() => {
      setDisplaySaved(false);
    }, SAVED_TIMEOUT);
  }

  return (
    <div className="json-editor">
      {errors.map((err) => (
        <p key={err}>Error: {err}</p>
      ))}
      <textarea
        className="textarea"
        value={textAreaVal}
        ref={textareaEl}
        onChange={handleChange}
        spellCheck="false"
      />
      <button onClick={handleClick}>Save</button>
      {displaySaved && <span className="saved">Saved</span>}
    </div>
  );
}

JsonConfig.propTypes = {
  errors: PropTypes.array,
  options: PropTypes.object,
  setErrors: PropTypes.func,
  setOptions: PropTypes.func,
};
