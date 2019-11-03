import "@testing-library/jest-dom/extend-expect";
import App from ".";
import React from "react";
import { render } from "@testing-library/react";

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

test("Options display title", async () => {
  const { findByText } = render(<App />);
  await findByText("Prettier Options");
});
