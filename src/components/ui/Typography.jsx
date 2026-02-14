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
        <h2 className={`text-xs sm:text-sm uppercase font-bold tracking-[0.2em] text-emerald-400/80 mb-4 flex items-center gap-2 ${className}`}>
            <span className="w-8 h-[1px] bg-emerald-500/50 inline-block"></span>
            {children}
        </h2>
    );
}
