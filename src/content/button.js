const CANCEL = "Cancel";
const CLOSE_ISSUE = " Close issue";
const CLOSE_PULL_REQUEST = " Close pull request";
const COMMENT = "Comment";
const CREATE_PULL_REQUEST = "Create pull request";
const SUBMIT_NEW_ISSUE = "Submit new issue";

export const BUTTONS = {
  CANCEL,
  CLOSE_ISSUE,
  CLOSE_PULL_REQUEST,
  COMMENT,
  CREATE_PULL_REQUEST,
  SUBMIT_NEW_ISSUE
};

export const BUTTONS_TO_SEARCH_FOR = [
  CANCEL,
  CLOSE_ISSUE,
  CLOSE_PULL_REQUEST,
  COMMENT,
  CREATE_PULL_REQUEST,
  SUBMIT_NEW_ISSUE
];

export default function renderButton(
  el,
  { classes = [], style = {}, append = true, refNode = null } = {}
) {
  const button = document.createElement("button");
  button.textContent = "Prettier";
  button.type = "button";
  button.classList.add("btn", ...classes);

  for (const [key, value] of Object.entries(style)) {
    button.style[key] = value;
  }

  if (refNode) {
    el.insertBefore(button, refNode);
  } else if (append) {
    el.append(button);
  } else {
    el.prepend(button);
  }

  return button;
}
