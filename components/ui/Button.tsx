
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-3 text-2xl font-bold uppercase tracking-widest
        border-2 border-cyan-400 text-cyan-400
        bg-black/50 backdrop-blur-sm
        hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_theme(colors.cyan.400)]
        focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700/50 disabled:border-gray-500 disabled:text-gray-400 disabled:shadow-none
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
