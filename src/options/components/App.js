import JsonConfig from "./JsonConfig";
import PropTypes from "prop-types";
import React from "react";
import VisualConfig from "./VisualConfig";

export default function App({ options, error, setOption, setError }) {
  function handleChange({ target: { checked } }) {
    setOption("json", "enable", checked);
  }

  if (!options) {
    return null;
  }

  const {
    prettier: prettierOptions,
    json: { enable: jsonEnable, config: jsonConfig }
  } = options;

  return (
    <>
      <hr />
      <label>
        Use JSON configuration
        <input type="checkbox" checked={jsonEnable} onChange={handleChange} />
      </label>
      {jsonEnable ? (
        <JsonConfig
          config={jsonConfig}
          error={error}
          prettierOptions={prettierOptions}
          setError={setError}
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
  setError: PropTypes.func,
  setOption: PropTypes.func
};
