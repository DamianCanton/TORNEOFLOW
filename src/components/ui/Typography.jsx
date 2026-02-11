import React from 'react';

export function GradientTitle({ children, className = '', size = 'large' }) {
    const sizeClasses = {
        large: "text-4xl sm:text-6xl",
        medium: "text-2xl sm:text-4xl",
        small: "text-xl sm:text-2xl"
    };

    return (
        <h1 className={`${sizeClasses[size]} font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-sm ${className}`}>
            {children}
        </h1>
    );
}

export function SectionTitle({ children, className = '' }) {
    return (
        <h2 className={`text-[10px] uppercase font-bold tracking-widest text-slate-500 ${className}`}>
            {children}
        </h2>
    );
}
