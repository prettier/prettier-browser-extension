import JsonConfig from "./JsonConfig";
import PropTypes from "prop-types";
import React from "react";
import VisualConfig from "./VisualConfig";

export default function App({ options, errors, setOptions, setErrors }) {
  function handleChange({ target: { checked } }) {
    setOptions({ ...options, isJsonVisible: checked });
  }

  function setPrettierOptions(newOptions) {
    setOptions({
      ...options,
      prettierOptions: { ...options.prettierOptions, ...newOptions },
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
      <hr />
      {isJsonVisible ? (
        <JsonConfig
          errors={errors}
          options={prettierOptions}
          setErrors={setErrors}
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
  errors: PropTypes.array,
  options: PropTypes.object,
  setErrors: PropTypes.func,
  setOptions: PropTypes.func,
};
