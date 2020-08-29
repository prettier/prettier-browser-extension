import browser from "webextension-polyfill";
import React, { useEffect, useState } from "react";

import App from "./App";
import defaultOptions from "./options";

export default function AppContainer() {
  const [options, setOptions] = useState(defaultOptions);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await browser.storage.sync.get();
      setOptions({ ...defaultOptions, ...data });
    })();
  }, []);

  useEffect(() => {
    browser.storage.sync.set(options);
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
