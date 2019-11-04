import React, { useState } from "react";
import PropTypes from "prop-types";

const PLACEHOLDER_TEXT = `{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true
}`;
const SAVED_TIMEOUT = 500;

export default function JsonConfig({
  config,
  error,
  setJsonConfig,
  setJsonParseError
}) {
  const [textAreaVal, setTextAreaVal] = useState(config);
  const [displaySaved, setDisplaySaved] = useState(false);

  function handleChange({ target: { value } }) {
    setTextAreaVal(value);
  }

  function handleClick() {
    try {
      JSON.parse(textAreaVal);
      setJsonParseError(false);
      setDisplaySaved(true);
      window.setTimeout(() => setDisplaySaved(false), SAVED_TIMEOUT);
    } catch {
      setJsonParseError(true);
    } finally {
      setJsonConfig(textAreaVal);
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
        placeholder={PLACEHOLDER_TEXT}
        onChange={handleChange}
      />
      <button onClick={handleClick}>Save</button>
    </>
  );
}

JsonConfig.propTypes = {
  config: PropTypes.string,
  error: PropTypes.boolean,
  setJsonConfig: PropTypes.func,
  setJsonParseError: PropTypes.func
};
