import React from 'react';
import { SelectProps } from '../types';
import { ChevronDown } from 'lucide-react';

const Select: React.FC<SelectProps> = ({ label, options, error, id, required, className = '', ...props }) => {
  return (
    <div className={`mb-0 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`
            block w-full appearance-none rounded-lg border bg-slate-50 px-4 py-3 text-slate-900 text-sm shadow-sm
            transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-slate-400
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
              : 'border-slate-200 focus:border-blue-600 focus:ring-blue-50'
            }
          `}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium ml-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;