import React, { useCallback } from "react";
import PropTypes from "prop-types";

import JsonConfig from "./JsonConfig";
import VisualConfig from "./VisualConfig";
import TabSwitcher from "./TabSwitcher";

export default function App({ options, errors, setOptions, setErrors }) {
  const setPrettierOptions = useCallback(
    (newOptions) => {
      setOptions({
        ...options,
        prettierOptions: { ...options.prettierOptions, ...newOptions },
      });
    },
    [options, setOptions]
  );

  if (!options) {
    return null;
  }

  const { prettierOptions, isJsonVisible } = options;

  return (
    <>
      <div className="header">
        <a className="title" href="https://prettier.io/docs/en/options.html">
          Options
        </a>
        <TabSwitcher options={options} setOptions={setOptions} />
      </div>
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
