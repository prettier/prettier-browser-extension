const defaultOptions = {
  isJsonVisible: false,
  prettierOptions: {
    arrowParens: "always",
    bracketSpacing: true,
    jsxBracketSameLine: false,
    printWidth: 80,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    useTabs: false,
  },
};

export default defaultOptions;

export function validateOptions(options) {
  const validationMap = Object.entries(defaultOptions.prettierOptions).reduce(
    (acc, [key, val]) => {
      acc[key] = typeof val;
      return acc;
    },
    {}
  );
  const errors = [];

  for (const [key, val] of Object.entries(options)) {
    if (!Object.hasOwnProperty.call(validationMap, key)) {
      errors.push(`${key} is an invalid option`);
    }

    if (typeof val !== validationMap[key]) {
      errors.push(`${key} should be of type ${validationMap[key]}`);
    }
  }

  return errors;
}
