import React from 'react';
import { TextAreaProps } from '../types';

const TextArea: React.FC<TextAreaProps> = ({ label, error, id, className = '', ...props }) => {
  return (
    <div className={`relative mb-6 ${className}`}>
      <div className="relative">
        <textarea
          id={id}
          className={`
            peer block w-full rounded-xl border-2 bg-transparent px-4 pb-2.5 pt-5 text-sm text-slate-900 
            focus:outline-none focus:ring-0 min-h-[120px] resize-y transition-colors duration-200
            ${error 
              ? 'border-red-400 focus:border-red-500' 
              : 'border-slate-200 focus:border-indigo-500'
            }
          `}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={id}
          className={`
            absolute left-4 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm duration-200 
            peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
            peer-focus:-translate-y-4 peer-focus:scale-75
            ${error ? 'text-red-400' : 'text-slate-500 peer-focus:text-indigo-500'}
          `}
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;