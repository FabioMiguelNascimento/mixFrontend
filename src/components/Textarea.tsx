import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, id, ...rest }) => {
  const textareaId = id || name;

  return (
    <div className="form-group">
      <label htmlFor={textareaId}>{label}</label>
      <textarea id={textareaId} name={name} {...rest} />
    </div>
  );
};

export default Textarea;
