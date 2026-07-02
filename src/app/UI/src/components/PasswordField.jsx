import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordField = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Enter your password',
  error,
  helperText,
  required = false,
  autoComplete = 'current-password',
  className = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100',
  containerClassName = '',
  ariaLabel,
}) => {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={fieldId}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-label={ariaLabel || label || placeholder}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-md px-1 text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
      {helperText && <p className="mt-2 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
