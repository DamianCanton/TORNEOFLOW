import React from 'react';

export default function Layout({ children, className = '' }) {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black relative overflow-hidden font-sans text-slate-200 selection:bg-emerald-500/30 selection:text-white flex flex-col">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Content Container */}
            <div className={`relative z-10 w-full flex-1 ${className}`}>
                {children}
            </div>
        </div>
    );
}
