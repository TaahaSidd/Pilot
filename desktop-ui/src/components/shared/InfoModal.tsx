import type { ReactNode } from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'color-mix(in srgb, var(--background) 72%, transparent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--surface)', padding: '32px', borderRadius: '12px',
                width: '400px', border: '1px solid var(--border)', color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-lg)'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>{title}</h3>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{children}</div>
                <button onClick={onClose} style={{
                    marginTop: '24px', padding: '8px 16px', background: 'var(--surface-subtle)',
                    color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer'
                }}>Got it</button>
            </div>
        </div>
    );
}
