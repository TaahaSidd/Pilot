import React, { useEffect, useState } from 'react';

type ToastType = 'normal' | 'success' | 'warning' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const colors: Record<ToastType, string> = {
    normal: '#333',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626'
};

export function Toast({ message, type, onClose }: ToastProps) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(onClose, 400); // Allow time for exit animation
        }, 3600);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: colors[type],
            color: '#FFF',
            padding: '12px 32px',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
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
                    background: 'none', border: 'none', color: '#FFF',
                    cursor: 'pointer', opacity: 0.6, fontSize: '16px', padding: '0'
                }}
            >
                &times;
            </button>
        </div>
    );
}