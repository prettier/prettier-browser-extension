import "./testUtils";
import renderButton from "./button";

const buttonRef = {};
const element = document.createElement("div");

beforeEach(() => (document.body.innerHTML = ""));

test.each([
  [{}, [element, buttonRef]],
  [{ append: false }, [buttonRef, element]],
  [{ refNode: element }, [buttonRef, element]]
])("renderButton with %p", (positionOptions, expectedOrder) => {
  document.body.appendChild(element);
  buttonRef.current = renderButton(document.body, {
    classes: ["btn2"],
    style: { color: "blue" },
    ...positionOptions
  });

  expect(Array.from(document.body.childNodes)).toEqual(
    expectedOrder.map(thing => thing.current || thing)
  );
  expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
  expect(buttonRef.current).toHaveTextContent("Prettier");
  expect(buttonRef.current).toHaveAttribute("type", "button");
  expect(buttonRef.current).toHaveClass("btn", "btn2");
  expect(buttonRef.current).toHaveStyle("color: blue;");
  expect(buttonRef.current).toBeInTheDocument();
});
