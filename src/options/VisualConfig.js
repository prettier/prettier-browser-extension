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
    label: "Tab width",
    name: "tabWidth",
    type: "number",
  },
  {
    description: "Indent lines with tabs instead of spaces.",
    label: "Use tabs",
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
    description: `Use 'single' quotes instead of "double" quotes.`,
    label: "Use single quotes",
    name: "singleQuote",
    type: "checkbox",
  },
  {
    description: "Print trailing commas wherever possible.",
    label: "Trailing commas",
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
    label: "Bracket spacing",
    name: "bracketSpacing",
    type: "checkbox",
  },
  {
    description: `Put the ">" of a multi-line JSX element at the end of the last line
                  instead of being alone on the next line.`,
    label: "JSX Brackets",
    name: "jsxBracketSameLine",
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
