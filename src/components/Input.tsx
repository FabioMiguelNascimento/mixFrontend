import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, name, id, ...rest }) => {
  const inputId = id || name;

  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} name={name} {...rest} />
    </div>
  );
};

export default Input;
