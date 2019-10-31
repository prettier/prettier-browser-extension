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

describe("Options", () => {
  it("displays title", async () => {
    const { findByText } = render(<App />);
    await findByText("Prettier Options");
  });
});
