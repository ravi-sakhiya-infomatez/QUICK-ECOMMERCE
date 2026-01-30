'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast, Toast } from '@/store/toastSlice';
import { CheckCircle2, AlertCircle, Info, Gift, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toaster() {
    const toasts = useAppSelector((state) => state.toast.toasts);
    const dispatch = useAppDispatch();

    return (
        <div className="fixed top-6 left-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => dispatch(removeToast(toast.id))}
                />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, toast.duration);
        return () => clearTimeout(timer);
    }, [toast.duration, onClose]);

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-white" />,
        error: <AlertCircle className="h-5 w-5 text-white" />,
        info: <Info className="h-5 w-5 text-white" />,
        reward: <Gift className="h-5 w-5 text-white animate-bounce" />,
    };

    const themes = {
        success: 'bg-green-600 border-green-500 shadow-green-900/20 text-white',
        error: 'bg-red-600 border-red-500 shadow-red-900/20 text-white',
        info: 'bg-blue-600 border-blue-500 shadow-blue-900/20 text-white',
        reward: 'bg-purple-600 border-purple-500 shadow-purple-900/20 text-white',
    };

    return (
        <div className={`pointer-events-auto group relative overflow-hidden rounded-xl border p-4 shadow-2xl transition-all animate-in slide-in-from-left duration-500 ${themes[toast.type as keyof typeof themes]}`}>
            <div className="flex gap-3">
                <div className="shrink-0">{icons[toast.type as keyof typeof icons]}</div>
                <div className="flex-1 space-y-1">
                    <h5 className="text-sm font-bold leading-none tracking-tight text-white">
                        {toast.title}
                    </h5>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                        {toast.message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 h-5 w-5 rounded-md hover:bg-black/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X className="h-3 w-3 text-white" />
                </button>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress" style={{ animationDuration: `${toast.duration}ms` }} />
        </div>
    );
}
