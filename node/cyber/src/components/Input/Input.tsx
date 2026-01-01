import { useState } from 'react';
import './Input.css';

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: 'user' | 'password';
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showPasswordToggle
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="input-field"
      />
      {icon === 'user' && value && (
        <button
          type="button"
          className="input-icon"
          onClick={handleClear}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      {showPasswordToggle && (
        <button
          type="button"
          className="input-icon"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      )}
    </div>
  );
};
