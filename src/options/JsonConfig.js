import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import parserBabylon from "prettier/parser-babylon";
import prettier from "prettier/standalone";
import { validateOptions } from "./options";

const SAVED_TIMEOUT = 500;

export default function JsonConfig({ errors, options, setErrors, setOptions }) {
  const textareaEl = useRef(null);
  const [textAreaVal, setTextAreaVal] = useState(JSON.stringify(options));
  const [displaySaved, setDisplaySaved] = useState(false);

  function handleChange({ target: { value } }) {
    setTextAreaVal(value);
  }

  useEffect(() => {
    try {
      setTextAreaVal(
        prettier.format(textAreaVal, {
          parser: "json",
          plugins: [parserBabylon],
          ...options
        })
      );
    } catch {}
  }, [options, textAreaVal]);

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
    <>
      {errors.map((err, idx) => (
        <p key={idx}>Error: {err}</p>
      ))}
      {displaySaved && <p>Saved</p>}
      <textarea
        value={textAreaVal}
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
  errors: PropTypes.array,
  options: PropTypes.object,
  setErrors: PropTypes.func,
  setOptions: PropTypes.func
};
