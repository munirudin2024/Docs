import { useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: 'user' | 'password';
  showPasswordToggle?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  icon,
  showPasswordToggle,
  disabled = false,
  required = false,
  name,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    // Emit clear event
  };

  return (
    <div className={`input-wrapper ${isFocused ? 'focused' : ''}`}>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        required={required}
        name={name}
        className="input-field"
        {...rest}
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
