import React, { useState } from 'react';
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
} from '@floating-ui/react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownWrapperProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}

const DropdownWrapper: React.FC<DropdownWrapperProps> = ({
  trigger,
  options,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    placement: 'bottom-start',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleOptionClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <>
      <div className="dropdown-trigger" ref={refs.setReference} {...getReferenceProps()}>
        {trigger}
      </div>
      <FloatingPortal>
        {isOpen && (
          <div
            className="dropdown-content"
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
              zIndex: 1050,
            }}
            {...getFloatingProps()}
          >
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
      </FloatingPortal>
    </>
  );
};

export default DropdownWrapper;
