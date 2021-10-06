import { useEffect } from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";

import { Input, CheckBox, Select } from "./FormComponents";

const fields = [
  {
    description: "Specify the line length that the printer will wrap on.",
    label: "Print Width",
    name: "printWidth",
    type: "number",
  },
  {
    description: "Specify the number of spaces per indentation-level.",
    label: "Tab Width",
    name: "tabWidth",
    type: "number",
  },
  {
    description: "Indent lines with tabs instead of spaces.",
    label: "Tabs",
    name: "useTabs",
    type: "checkbox",
  },
  {
    description: "Print semicolons at the ends of statements.",
    label: "Semicolons",
    name: "semi",
    type: "checkbox",
  },
  {
    description: "Use single quotes instead of double quotes.",
    label: "Quotes",
    name: "singleQuote",
    type: "checkbox",
  },
  {
    description: "Change when properties in objects are quoted.",
    label: "Quote Props",
    name: "quoteProps",
    options: [
      { label: "as-needed", value: "as-needed" },
      { label: "consistent", value: "consistent" },
      { label: "preserve", value: "preserve" },
    ],
    type: "select",
  },
  {
    description: "Use single quotes instead of double quotes in JSX.",
    label: "JSX Quotes",
    name: "jsxSingleQuote",
    type: "checkbox",
  },
  {
    description:
      "Print trailing commas wherever possible in multi-line comma-separated syntactic structures. (A single-line array, for example, never gets trailing commas.)",
    label: "Trailing Commas",
    name: "trailingComma",
    options: [
      { label: "none", value: "none" },
      { label: "es5", value: "es5" },
      { label: "all", value: "all" },
    ],
    type: "select",
  },
  {
    description: "Print spaces between brackets in object literals.",
    label: "Bracket Spacing",
    name: "bracketSpacing",
    type: "checkbox",
  },
  {
    description: `Put the ">" of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).`,
    label: "Bracket Line",
    name: "bracketSameLine",
    type: "checkbox",
  },
  {
    description: "Include parentheses around a sole arrow function parameter.",
    label: "Arrow Function Parentheses",
    name: "arrowParens",
    options: [
      { label: "avoid", value: "avoid" },
      { label: "always", value: "always" },
    ],
    type: "select",
  },
  {
    description:
      'By default, Prettier will wrap markdown text as-is since some services use a linebreak-sensitive renderer, e.g. GitHub comment and BitBucket. In some cases you may want to rely on editor/viewer soft wrapping instead, so this option allows you to opt out with "never".',
    label: "Prose Wrap",
    name: "proseWrap",
    options: [
      { label: "always", value: "always" },
      { label: "never", value: "never" },
      { label: "preserve", value: "preserve" },
    ],
    type: "select",
  },
  {
    description:
      "Specify the global whitespace sensitivity for HTML, Vue, Angular, and Handlebars. See whitespace-sensitive formatting for more info.",
    label: "HTML Whitespace Sensitivity",
    name: "htmlWhitespaceSensitivity",
    options: [
      { label: "css", value: "css" },
      { label: "strict", value: "strict" },
      { label: "ignore", value: "ignore" },
    ],
    type: "select",
  },
  {
    description:
      "Whether or not to indent the code inside <script> and <style> tags in Vue files. Some people (like the creator of Vue) don’t indent to save an indentation level, but this might break code folding in your editor.",
    label: "Vue files script and style tags indentation",
    name: "vueIndentScriptAndStyle",
    type: "boolean",
  },
  {
    description:
      "Control whether Prettier formats quoted code embedded in the file.",
    label: "Embedded Language Formatting",
    name: "embeddedLanguageFormatting",
    options: [
      { label: "auto", value: "auto" },
      { label: "off", value: "off" },
    ],
    type: "select",
  },
];

const componentMap = {
  checkbox: CheckBox,
  default: () => null,
  number: Input,
  select: Select,
  text: Input,
};

// Form based on https://github.com/codesandbox/codesandbox-client/blob/master/packages/app/src/app/pages/common/Modals/PreferencesModal/CodeFormatting/Prettier/index.tsx
export default function VisualConfig(props) {
  const { options, setOptions } = props;
  const { register, reset } = useForm({ defaultValues: options });

  function handleOptionsChange(event) {
    const {
      target: { checked, name, type, value },
    } = event;

    setOptions({
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value)
          : value,
    });
  }

  useEffect(() => {
    reset(options);
  }, [options, reset]);

  return (
    <form className="form">
      {fields.map((field) => {
        const inputProps = {
          description: field.description,
          label: field.label,
          name: field.name,
          onChange: handleOptionsChange,
          options: field.options,
          register,
          type: field.type,
        };

        const FormComponent = componentMap[field.type] || componentMap.default;

        return (
          <div className="form-group" key={field.name}>
            <FormComponent {...inputProps} />
          </div>
        );
      })}
    </form>
  );
}

VisualConfig.propTypes = {
  options: PropTypes.object.isRequired,
  setOptions: PropTypes.func.isRequired,
};
