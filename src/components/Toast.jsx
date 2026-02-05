import { useEffect, useState } from 'react';
import useAppStore from '../store';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const TOAST_DURATION = 3000;

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle
};

const styleMap = {
    success: {
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400'
    },
    error: {
        border: 'border-rose-500/30',
        iconBg: 'bg-rose-500/20',
        iconColor: 'text-rose-400'
    },
    warning: {
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400'
    }
};

function Toast({ toast, onRemove }) {
    const [isExiting, setIsExiting] = useState(false);
    const Icon = iconMap[toast.type] || CheckCircle;
    const styles = styleMap[toast.type] || styleMap.success;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
        }, TOAST_DURATION);

        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div className={`
            pointer-events-auto
            bg-slate-900/90 backdrop-blur-xl
            border ${styles.border}
            rounded-xl px-4 py-3
            shadow-2xl
            flex items-center gap-3
            min-w-[280px] max-w-[400px]
            ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
        `}>
            <div className={`flex-shrink-0 p-2 rounded-lg ${styles.iconBg}`}>
                <Icon size={16} className={styles.iconColor} />
            </div>
            <span className="text-slate-200 text-sm font-medium flex-1">
                {toast.message}
            </span>
        </div>
    );
}

export default function ToastContainer() {
    const toasts = useAppStore((state) => state.toasts);
    const removeToast = useAppStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onRemove={removeToast}
                />
            ))}
        </div>
    );
}
