import React from 'react';

export default function Button({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    type = 'button',
    icon: Icon = null
}) {
    const baseStyles = "rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all group";

    // Variant styles
    const variants = {
        primary: disabled
            ? "bg-white/5 text-slate-500 cursor-not-allowed border-t border-white/5"
            : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.7)] hover:scale-[1.02] active:scale-[0.98] border-t border-white/20",

        secondary: "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10",

        danger: "bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500",

        ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-emerald-400"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-70 pointer-events-none' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && <Icon size={18} className={variant === 'primary' && !disabled ? 'fill-white' : ''} />}
            {children}
        </button>
    );
}
