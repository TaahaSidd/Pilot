import { useEffect, useState } from 'react';

type ToastType = 'normal' | 'success' | 'warning' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    persistent?: boolean;
    position?: 'bottom-center' | 'top-right';
}

const colors: Record<ToastType, string> = {
    normal: 'var(--surface-overlay)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
};

export function Toast({ message, type, onClose, persistent = false, position = 'bottom-center' }: ToastProps) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (persistent) {
            return;
        }

        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 400); // Allow time for exit animation
        }, 3600);
        return () => clearTimeout(timer);
    }, [onClose, persistent]);

    const positionStyle = position === 'top-right'
        ? {
            top: '24px',
            right: '24px',
            transform: 'none',
        }
        : {
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
        };

    return (
        <div style={{
            position: 'fixed',
            ...positionStyle,
            backgroundColor: colors[type],
            color: type === 'normal' ? 'var(--text-primary)' : 'var(--text-on-accent)',
            padding: '12px 32px',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            // Snappy entrance, smooth exit
            animation: isLeaving
                ? 'slideDownFade 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
                : 'slideUpFade 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            pointerEvents: 'auto'
        }}>
            {message}
            <button
                onClick={onClose}
                style={{
                    background: 'none', border: 'none', color: 'currentColor',
                    cursor: 'pointer', opacity: 0.6, fontSize: '16px', padding: '0'
                }}
            >
                &times;
            </button>
        </div>
    );
}
