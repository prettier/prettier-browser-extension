import AppContainer from "./AppContainer";
import React from "react";
import { render } from "@testing-library/react";

window.chrome = {
  storage: {
    sync: {
      get(callback) {
        setTimeout(() => callback({}));
      },
      set() {},
    },
  },
};

test("App", () => {
  render(<AppContainer />);
});
