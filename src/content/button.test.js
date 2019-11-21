import "./testUtils";
import renderButton from "./button";

test("renderButton", () => {
  const button = renderButton(document.body, {
    classes: ["btn2"],
    style: { color: "blue" }
  });

  expect(button).toBeInstanceOf(HTMLButtonElement);
  expect(button).toHaveTextContent("Prettier");
  expect(button).toHaveAttribute("type", "button");
  expect(button).toHaveClass("btn", "btn2");
  expect(button).toHaveStyle("color: blue;");
  expect(button).toBeInTheDocument();
});
