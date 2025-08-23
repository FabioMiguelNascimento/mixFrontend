import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  label: string;
  value?: number | string | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  decimalPlaces?: number;
  decimalSeparator?: '.' | ',';
  error?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value: propValue,
  onChange,
  min,
  max,
  allowDecimals = true,
  decimalPlaces = 2,
  decimalSeparator = '.',
  error,
  required,
  name,
  id,
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (propValue != null) {
      setDisplayValue(propValue.toString().replace('.', decimalSeparator));
    } else {
      setDisplayValue('');
    }
  }, [propValue, decimalSeparator]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    let sanitizedValue = inputValue.replace(new RegExp(`[^0-9\${decimalSeparator}]`, 'g'), '');

    if (!allowDecimals) {
      sanitizedValue = sanitizedValue.replace(new RegExp(`\${decimalSeparator}`, 'g'), '');
    } else {
      const parts = sanitizedValue.split(decimalSeparator);
      if (parts.length > 2) {
        sanitizedValue = `${parts[0]}${decimalSeparator}${parts.slice(1).join('')}`;
      }

      if (parts.length === 2 && parts[1].length > decimalPlaces) {
        sanitizedValue = `${parts[0]}${decimalSeparator}${parts[1].substring(0, decimalPlaces)}`;
      }
    }

    setDisplayValue(sanitizedValue);

    const numericValueStr = sanitizedValue.replace(decimalSeparator, '.');
    if (numericValueStr === '' || numericValueStr === '.') {
      onChange?.(null);
    } else {
      const numericValue = parseFloat(numericValueStr);
      if (!isNaN(numericValue)) {
        onChange?.(numericValue);
      }
    }
  };

  const handleBlur = () => {
    const numericValueStr = displayValue.replace(decimalSeparator, '.');
    let numericValue = parseFloat(numericValueStr);

    if (isNaN(numericValue)) {
      return;
    }

    let hasChanged = false;
    
    if (min !== undefined && numericValue < min) {
      numericValue = min;
      hasChanged = true;
    }
    if (max !== undefined && numericValue > max) {
      numericValue = max;
      hasChanged = true;
    }

    if (hasChanged) {
      const finalValueStr = numericValue.toString().replace('.', decimalSeparator);
      setDisplayValue(finalValueStr);
    }

    if (onChange) {
      const originalValue = propValue ?? null;
      if (originalValue !== numericValue) {
        onChange(numericValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, code } = e;

    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
        e.key === 'Escape' || e.key === 'Enter' || e.key.startsWith('Arrow') || 
        e.key === 'Home' || e.key === 'End' || e.key === 'Insert' || 
        e.ctrlKey || e.metaKey) {
        return;
    }

    if (/^\d$/.test(key)) {
        if (max !== undefined) {
            const currentValue = displayValue + key;
            const numericValue = parseFloat(currentValue.replace(decimalSeparator, '.'));
            if (!isNaN(numericValue) && numericValue > max) {
                e.preventDefault();
                return;
            }
        }
        return;
    }

    if (allowDecimals) {
        const isDecimalSeparator = 
            (decimalSeparator === '.' && (key === '.' || code === 'NumpadDecimal' || code === 'Period')) ||
            (decimalSeparator === ',' && (key === ',' || code === 'Comma' || code === 'NumpadComma'));
        
        if (isDecimalSeparator) {
            if (displayValue.includes(decimalSeparator)) {
                e.preventDefault();
            }
            return;
        }
    }

    e.preventDefault();
  };

  const inputId = id || name;

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        {...rest}
        id={inputId}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-invalid={!!error}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};


export default NumberInput;
