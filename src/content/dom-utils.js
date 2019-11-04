export function findWithClass(buttonElement, classToFind) {
  const alreadySeen = [];
  const alreadyAdded = [];
  const childrenNodes = [buttonElement];

  while (childrenNodes.length > 0) {
    const thisChild = childrenNodes.pop();
    const classList = thisChild.classList
      ? Array.from(thisChild.classList)
      : [];

    if (
      thisChild.tagName &&
      !classList.includes(classToFind) &&
      !alreadySeen.includes(thisChild)
    ) {
      if (!alreadyAdded.includes(thisChild.parentNode)) {
        childrenNodes.push(thisChild.parentNode);
        alreadyAdded.push(thisChild.parentNode);
      }
      alreadySeen.push(thisChild);
      childrenNodes.push(...thisChild.childNodes);
    }

    if (classList.includes(classToFind)) {
      return thisChild;
    }
  }

  return null;
}

export function isElementVisible(element) {
  const boundingRect = element.getBoundingClientRect();

  return (
    // This is 0 if the element is hidden.
    element.offsetHeight > 0 &&
    // Check if the element is in the viewport.
    boundingRect.top >= 0 &&
    boundingRect.left >= 0 &&
    boundingRect.bottom <= window.innerHeight &&
    boundingRect.right <= window.innerWidth
  );
}
