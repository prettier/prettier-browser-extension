import JsonConfig from "./JsonConfig";
import PropTypes from "prop-types";
import React from "react";
import VisualConfig from "./VisualConfig";

export default function App({ options, error, setOption, setJsonError }) {
  function handleChange({ target: { checked } }) {
    setOption("json", "enable", checked);
  }

  if (!options) {
    return null;
  }

  const {
    prettier: prettierOptions,
    json: { enable: enableJson, config: jsonConfig }
  } = options;

  return (
    <>
      <hr />
      <label>
        Use JSON configuration
        <input type="checkbox" checked={enableJson} onChange={handleChange} />
      </label>
      {enableJson ? (
        <JsonConfig
          config={jsonConfig}
          error={error}
          prettierOptions={prettierOptions}
          setJsonError={setJsonError}
          setOption={setOption}
        />
      ) : (
        <VisualConfig options={prettierOptions} setOption={setOption} />
      )}
    </>
  );
}

App.propTypes = {
  error: PropTypes.bool,
  options: PropTypes.object,
  setJsonError: PropTypes.func,
  setOption: PropTypes.func
};
