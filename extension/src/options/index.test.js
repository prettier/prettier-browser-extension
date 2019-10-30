import "@testing-library/jest-dom/extend-expect";
import App from ".";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

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
    const root = document.createElement("div");
    document.body.appendChild(root);
    act(() => {
      ReactDOM.render(<App />, root);
    });
    expect(document.body).toHaveTextContent("Prettier Options");
  });
});
