
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  noLabel?: boolean;
}

const Input: React.FC<InputProps> = ({ label, id, noLabel, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {!noLabel && <label htmlFor={inputId} className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>}
      <input
        id={inputId}
        {...props}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
};

export default Input;
