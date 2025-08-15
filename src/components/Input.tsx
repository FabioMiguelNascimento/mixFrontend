import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label: string;
  error?: string;
  value?: string | null;
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
