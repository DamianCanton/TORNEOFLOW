import { useEffect, useState } from 'react';
import useAppStore from '../store';
import { CheckCircle } from 'lucide-react';

const PUSH_DURATION = 1200;

export default function PushNotification() {
    const pushNotification = useAppStore((state) => state.pushNotification);
    const hidePushNotification = useAppStore((state) => state.hidePushNotification);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (pushNotification) {
            setIsExiting(false);
            const timer = setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => hidePushNotification(), 200);
            }, PUSH_DURATION);

            return () => clearTimeout(timer);
        }
    }, [pushNotification, hidePushNotification]);

    if (!pushNotification) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[300] pointer-events-none">
            <div className={`
                pointer-events-auto
                bg-slate-900/95 backdrop-blur-xl
                border border-emerald-500/30
                rounded-xl px-5 py-3
                shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]
                flex items-center gap-3
                ${isExiting ? 'animate-push-out' : 'animate-push-in'}
            `}>
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-emerald-500/20">
                    <CheckCircle size={18} className="text-emerald-400" />
                </div>
                <span className="text-white text-sm font-semibold">
                    {pushNotification.message}
                </span>
            </div>
        </div>
    );
}
