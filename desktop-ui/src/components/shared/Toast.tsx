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
            top: 'var(--space-6)',
            right: 'var(--space-6)',
            transform: 'none',
        }
        : {
            bottom: 'var(--space-8)',
            left: '50%',
            transform: 'translateX(-50%)',
        };

    return (
        <div style={{
            position: 'fixed',
            ...positionStyle,
            backgroundColor: colors[type],
            color: type === 'normal' ? 'var(--text-primary)' : 'var(--text-on-accent)',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--type-body-size)',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            animation: isLeaving
                ? 'slideDownFade 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
                : 'slideUpFade 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 'var(--z-toast)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
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
                x
            </button>
        </div>
    );
}
