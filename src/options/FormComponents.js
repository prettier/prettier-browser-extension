import React from "react";
import PropTypes from "prop-types";

export const Input = (props) => {
  const { label, description, type, name, inputRef, onChange } = props;

  return (
    <>
      <label>{label}</label>
      <span className="description">{description}</span>
      <input type={type} name={name} ref={inputRef} onChange={onChange} />
    </>
  );
};

export const CheckBox = (props) => {
  const { label, description, name, inputRef, onChange } = props;
  return (
    <>
      <label>{label}</label>
      <input type="checkbox" name={name} ref={inputRef} onChange={onChange} />
      <span className="description">{description}</span>
    </>
  );
};

export const Select = (props) => {
  const { label, description, name, inputRef, onChange, options } = props;

  return (
    <>
      <label>{label}</label>
      <span className="description">{description}</span>
      <select name={name} ref={inputRef} onChange={onChange}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
};

Input.propTypes = {
  description: PropTypes.string.isRequired,
  inputRef: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

CheckBox.propTypes = {
  description: PropTypes.string.isRequired,
  inputRef: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

Select.propTypes = {
  description: PropTypes.string.isRequired,
  inputRef: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  type: PropTypes.string.isRequired,
};
