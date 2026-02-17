import React from 'react';
import { InputProps } from '../types';

const Input: React.FC<InputProps> = ({ label, error, id, required, className = '', ...props }) => {
  return (
    <div className={`mb-0 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        className={`
          block w-full rounded-lg border bg-slate-50 px-4 py-3 text-slate-900 text-sm shadow-sm
          transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-slate-400
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-50'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium ml-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;