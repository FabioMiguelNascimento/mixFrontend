import React from 'react';

interface ChipProps {
  text: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | string;
  size?: 'sm' | 'md' | 'lg';
}

const Chip: React.FC<ChipProps> = ({
  text,
  icon,
  variant = 'default',
  size = 'md',
}) => {
  const classes = [
    'chip',
    `chip--${variant}`,
    `chip--${size}`,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && <span className="chip__icon">{icon}</span>}
      <span className="chip__text">{text}</span>
    </span>
  );
};

export default Chip;
