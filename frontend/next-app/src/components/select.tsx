import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  className = '',
  placeholder,
  ...props
}) => {
  const baseStyles = 'block px-3 text-base border border-gray-300 rounded-md text-gray-700';
  const combinedClassName = `${baseStyles} ${className}`.trim();

  return (
    <select className={combinedClassName} {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
