import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode; // Add optional icon prop
}

interface DropdownWrapperProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  isOpen?: boolean; // Optional prop to control open state externally
  onOpenChange?: (isOpen: boolean) => void; // Callback for external control
}

const DropdownWrapper: React.FC<DropdownWrapperProps> = ({
  trigger,
  options,
  onSelect,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (newIsOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newIsOpen);
    }
    onOpenChange?.(newIsOpen);
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setIsOpen(false); // Close dropdown after selection
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={handleTriggerClick}>
        {trigger}
      </div>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option) => (
            <div
              key={option.value}
              className="dropdown-option"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.icon && <span className="dropdown-option__icon">{option.icon}</span>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownWrapper;
