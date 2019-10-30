import "@testing-library/jest-dom/extend-expect";
import App from ".";
import React from "react";
import { render } from "@testing-library/react";

window.chrome = {
  storage: {
    sync: {
      get(callback) {
        callback({});
      },
      set() {}
    }
  }
};

describe("Options", () => {
  it("displays title", () => {
    const { container } = render(<App />);
    expect(container).toHaveTextContent("Prettier Options");
  });
});
