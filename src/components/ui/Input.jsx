import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    className = '',
    inputClassName = '',
    ...props
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`
                    w-full px-4 py-3 bg-black/30 rounded-xl border text-white 
                    placeholder:text-slate-600 
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                    transition-all font-medium 
                    ${error ? 'border-rose-500/50' : 'border-white/10'}
                    ${type === 'date' ? '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : ''}
                    ${inputClassName}
                `}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
            {error && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                    <span className="text-rose-400 text-xs font-medium">{error}</span>
                </div>
            )}
        </div>
    );
}
