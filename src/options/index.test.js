import App from ".";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

window.chrome = {
  storage: {
    sync: {
      get(callback) {
        setTimeout(() => callback({}));
      },
      set() {}
    }
  }
};

test("Options render", () => {
  const root = document.createElement("div");
  document.body.appendChild(root);
  act(() => {
    ReactDOM.render(<App />, root);
  });
});
