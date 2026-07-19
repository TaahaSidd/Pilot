import type { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    message: string;
    illustration?: ReactNode;
    action?: ReactNode;
}

export function EmptyState({ title, message, illustration, action }: EmptyStateProps) {
    return (
        <div
            style={{
                display: 'grid',
                justifyItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-10) var(--space-6)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
            }}
        >
            {illustration}
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <h2 className="pilot-type-subsection-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                    {title}
                </h2>
                <p style={{ margin: 0, maxWidth: '420px' }}>
                    {message}
                </p>
            </div>
            {action}
        </div>
    );
}
