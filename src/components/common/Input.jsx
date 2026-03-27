import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
  ...rest
}) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}{required && ' *'}</label>}
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={error ? 'error' : ''}
          {...rest}
        >
          <option value="">Select {label}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={error ? 'error' : ''}
          rows="4"
          {...rest}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={error ? 'error' : ''}
          {...rest}
        />
      )}
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
