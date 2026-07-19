import type { ReactNode } from 'react';
import { Button, Card } from '../ui';

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
            position: 'fixed', inset: 0,
            backgroundColor: 'color-mix(in srgb, var(--background) 72%, transparent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 'var(--z-modal)', padding: 'var(--space-6)',
        }} onClick={onClose}>
            <Card
                padding="lg"
                style={{ width: 'min(400px, 100%)', boxShadow: 'var(--shadow-lg)' }}
                onClick={(event) => event.stopPropagation()}
            >
                <h3 className="pilot-type-section-title" style={{ margin: '0 0 var(--space-4)', color: 'var(--text-primary)' }}>{title}</h3>
                <div style={{ fontSize: 'var(--type-body-size)', color: 'var(--text-secondary)', lineHeight: 'var(--type-body-line)' }}>{children}</div>
                <Button variant="secondary" onClick={onClose} style={{ marginTop: 'var(--space-6)' }}>Got it</Button>
            </Card>
        </div>
    );
}
