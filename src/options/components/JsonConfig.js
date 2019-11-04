import React, { useState } from "react";
import PropTypes from "prop-types";

const placeholderText = `{
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true
}`;

export default function JsonConfig({
  config,
  error,
  setJsonConfig,
  setJsonParseError
}) {
  const [textAreaVal, setTextAreaVal] = useState(config);

  function handleChange({ target: { value } }) {
    setTextAreaVal(value);
  }

  function handleClick() {
    try {
      JSON.parse(textAreaVal);
      setJsonParseError(false);
    } catch {
      setJsonParseError(true);
    } finally {
      setJsonConfig(textAreaVal);
    }
  }

  return (
    <>
      <hr />
      {error && <p>Error: invalid JSON</p>}
      <textarea
        name="config"
        value={textAreaVal}
        columns={80}
        rows={24}
        placeholder={placeholderText}
        onChange={handleChange}
      />
      <button onClick={handleClick}>Save</button>
    </>
  );
}

JsonConfig.propTypes = {
  config: PropTypes.string,
  error: PropTypes.string,
  setJsonConfig: PropTypes.func,
  setJsonParseError: PropTypes.func
};
