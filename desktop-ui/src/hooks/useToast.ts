import { useState, useCallback } from 'react';

export type ToastType = 'normal' | 'success' | 'warning' | 'error';

export function useToast() {
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'normal') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    return { toast, showToast, hideToast: () => setToast(null) };
}