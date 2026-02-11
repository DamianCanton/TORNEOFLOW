import React from 'react';

export default function GlassCard({ children, className = '', hoverEffect = false }) {
    return (
        <div className={`
            bg-white/5 backdrop-blur-xl border border-white/10 
            shadow-2xl relative overflow-hidden
            ${hoverEffect ? 'transition-all duration-300 hover:bg-white/10 hover:border-white/20' : ''}
            ${className}
        `}>
            {/* Subtle Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
