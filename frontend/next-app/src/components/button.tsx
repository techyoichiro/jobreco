import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'attendance';
  height?: string; // 高さを指定できるようにする
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  height = 'auto', // デフォルトで自動に設定
  disabled = false,
  ...props
}) => {
  const baseStyles = `px-4 py-2 rounded-md font-semibold flex items-center justify-center`;
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    attendance: disabled
      ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
      : 'bg-white text-green-600 border border-green-600 hover:bg-green-50',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className} h-[${height}]`.trim();

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
