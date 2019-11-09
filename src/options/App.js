import JsonConfig from "./JsonConfig";
import PropTypes from "prop-types";
import React from "react";
import VisualConfig from "./VisualConfig";

export default function App({ options, error, setOptions, setError }) {
  function handleChange({ target: { checked } }) {
    setOptions({ ...options, isJsonVisible: checked });
  }

  function setPrettierOptions(newOptions) {
    setOptions({
      ...options,
      prettierOptions: { ...options.prettierOptions, ...newOptions }
    });
  }

  if (!options) {
    return null;
  }

  const { prettierOptions, isJsonVisible } = options;

  return (
    <>
      <hr />
      <label>
        Use JSON configuration
        <input
          type="checkbox"
          checked={isJsonVisible}
          onChange={handleChange}
        />
      </label>
      {isJsonVisible ? (
        <JsonConfig
          error={error}
          options={prettierOptions}
          setError={setError}
          setOptions={setPrettierOptions}
        />
      ) : (
        <VisualConfig
          options={prettierOptions}
          setOptions={setPrettierOptions}
        />
      )}
    </>
  );
}

App.propTypes = {
  error: PropTypes.string,
  options: PropTypes.object,
  setError: PropTypes.func,
  setOptions: PropTypes.func
};
