import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, name, id, error, required, ...rest }) => {
  const inputId = id || name;

  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} name={name} className={error ? 'input--error' : ''} {...rest} />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Input;
