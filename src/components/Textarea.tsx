import React from 'react';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  label: string;
  error?: string;
  value?: string | null;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, id, error, required, ...rest }) => {
  const textareaId = id || name;

  return (
    <div className="form-group">
      <label htmlFor={textareaId}>{label}</label>
      <textarea id={textareaId} name={name} className={error ? 'textarea--error' : ''} {...rest} />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Textarea;
