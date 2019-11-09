import React, { useEffect, useState } from "react";
import App from "./App";
import defaultOptions from "./options";
import { promisifiedChromeStorageSyncGet } from "../shared/chrome";

export default function AppContainer() {
  const [options, setOptions] = useState(defaultOptions);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    (async function initializeStateFromChromeStorage() {
      const data = await promisifiedChromeStorageSyncGet();
      setOptions({ ...defaultOptions, ...data });
    })();
  }, []);

  useEffect(() => {
    chrome.storage.sync.set(options);
  }, [options]);

  return (
    <App
      options={options}
      errors={errors}
      setOptions={setOptions}
      setErrors={setErrors}
    />
  );
}
