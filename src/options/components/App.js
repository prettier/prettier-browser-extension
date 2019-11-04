import React, { useEffect, useState } from "react";
import JsonConfig from "./JsonConfig";
import VisualConfig from "./VisualConfig";

const defaultPrettierOptions = {
  arrowParens: "avoid",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "none",
  useTabs: false
};

const defaultOptions = {
  json: {
    config: "",
    enable: false
  },
  prettier: defaultPrettierOptions
};

export default function App() {
  const [options, setOptions] = useState(defaultOptions);
  const [error, setError] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(items => {
      setOptions({
        ...defaultOptions
      });
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set(options);
  }, [options]);

  function handleOptionsChange({ target: { checked, name, type, value } }) {
    setOptions({
      ...options,
      prettier: {
        ...options.prettier,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? parseInt(value)
            : value
      }
    });
  }

  function setJsonConfig(key, val) {
    setOptions({
      ...options,
      json: {
        ...options.json,
        [key]: val
      }
    });
  }

  function setJsonParseError(hasError) {
    setError(hasError);
  }

  // Form based on https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/app/pages/common/Modals/PreferencesModal/CodeFormatting/Prettier/index.tsx
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
        <input
          type="checkbox"
          checked={enableJson}
          onChange={({ target: { checked } }) =>
            setJsonConfig("enable", checked)
          }
        />
      </label>
      {enableJson ? (
        <JsonConfig
          config={jsonConfig}
          error={error}
          setJsonParseError={setJsonParseError}
          setJsonConfig={json => setJsonConfig("config", json)}
        />
      ) : (
        <VisualConfig
          options={prettierOptions}
          handleOptionsChange={handleOptionsChange}
        />
      )}
    </>
  );
}
