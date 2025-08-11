import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<SpinnerSize, number> = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 52,
};

interface SpinnerProps {
  size?: SpinnerSize; // Changed type
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color }) => { // Default to 'md'
  const pixelSize = sizeMap[size];
  const petalStyle = color ? { backgroundColor: color } : {};

  return (
    <div className="spinner" style={{ width: pixelSize, height: pixelSize }}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="petal" style={petalStyle}></div>
      ))}
    </div>
  );
};

export default Spinner;
