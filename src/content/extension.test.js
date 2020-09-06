import "./testUtils";
import Extension from "./extension";
import { queryByText } from "@testing-library/dom";

test("Extension", async () => {
  await new Extension().init();
  expect(queryByText(document, "Prettier")).not.toBeInTheDocument();
});
