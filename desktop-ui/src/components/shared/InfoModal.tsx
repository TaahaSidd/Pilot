import React from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#181818', padding: '32px', borderRadius: '12px',
                width: '400px', border: '1px solid #333', color: '#FFF'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '16px' }}>{title}</h3>
                <div style={{ fontSize: '14px', color: '#AAA', lineHeight: '1.6' }}>{children}</div>
                <button onClick={onClose} style={{
                    marginTop: '24px', padding: '8px 16px', background: '#333',
                    color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer'
                }}>Got it</button>
            </div>
        </div>
    );
}