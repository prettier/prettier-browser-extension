import React, { useEffect, useState } from "react";
import App from "./App";
import { promisifiedChromeStorageSyncGet } from "../shared/chrome";

const defaultOptions = {
  json: {
    config: "",
    enable: false
  },
  prettier: {
    arrowParens: "avoid",
    bracketSpacing: true,
    jsxBracketSameLine: false,
    printWidth: 80,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "none",
    useTabs: false
  }
};

export default function AppContainer() {
  const [options, setOptions] = useState(defaultOptions);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async function initializeStateFromChromeStorage() {
      const data = await promisifiedChromeStorageSyncGet();
      setOptions({ ...defaultOptions, ...data });
    })();
  }, []);

  useEffect(() => {
    chrome.storage.sync.set(options);
  }, [options]);

  function setOption(section, key, val) {
    setOptions({
      ...options,
      [section]: {
        ...options[section],
        [key]: val
      }
    });
  }

  return (
    <App
      options={options}
      error={error}
      setOption={setOption}
      setError={setError}
    />
  );
}
