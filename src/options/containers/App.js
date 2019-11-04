import React, { useEffect, useState } from "react";
import App from "../components/App";
import { promisifiedChromeStorageSyncGet } from "../../shared/chrome";

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
    async function getChromeStorageData() {
      const data = await promisifiedChromeStorageSyncGet();
      setOptions({ ...defaultOptions, ...data });
    }

    getChromeStorageData();
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

  function setJsonError(hasError) {
    setError(hasError);
  }

  return (
    <App
      options={options}
      error={error}
      setOption={setOption}
      setJsonError={setJsonError}
    />
  );
}
