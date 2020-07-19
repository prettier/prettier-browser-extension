import prettier from "prettier/standalone";

import { PARSERS } from "./parsers";

const format = (text, options = {}) => {
  const formattedText = prettier.format(text, {
    parser: "markdown",
    plugins: PARSERS,
    ...options,
  });

  return formattedText;
};

export default format;
