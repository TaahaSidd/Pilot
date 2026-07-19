import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 'var(--space-6)',
                paddingBottom: 'var(--space-5)',
                borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
            }}
        >
            <div style={{ display: 'grid', gap: 'var(--space-2)', minWidth: 0 }}>
                <h1 className="pilot-type-page-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                    {title}
                </h1>
                {description && (
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        {description}
                    </p>
                )}
            </div>
            {actions}
        </header>
    );
}
