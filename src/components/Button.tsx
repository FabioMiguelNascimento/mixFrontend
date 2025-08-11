import React from 'react';
import Spinner from './Spinner'; // Import the Spinner component

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  size = 'md',
  ...rest
}) => {
  const baseClasses = 'button';
  const variantClass = `button--${variant}`;
  const loadingClass = loading ? 'button--loading' : '';
  const disabledClass = disabled || loading ? 'button--disabled' : '';
  const iconPositionClass = icon ? `button--icon-${iconPosition}` : '';
  const sizeClass = `button--${size}`; // Add size class

  const classes = [
    baseClasses,
    variantClass,
    loadingClass,
    disabledClass,
    iconPositionClass,
    sizeClass, // Add sizeClass here
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading ? (
        <Spinner size={size} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="button__icon button__icon--left">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="button__icon button__icon--right">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
