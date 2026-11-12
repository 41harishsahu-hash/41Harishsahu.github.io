import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Mandatory Reusable Password Input Component with Show/Hide Toggle
 */
export const PasswordInput = ({
  id,
  name = 'password',
  value,
  onChange,
  placeholder = 'Enter password',
  required = true,
  minLength = 8,
  maxLength = 72,
  autoComplete = 'current-password',
  isInvalid = false,
  className = '',
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`password-input-wrapper ${className}`}>
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
        aria-label={placeholder}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setShowPassword((prev) => !prev)}
        title={showPassword ? 'Hide password' : 'Show password'}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;

