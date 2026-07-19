import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
    padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)',
};

export function Card({ interactive = false, padding = 'md', className, style, ...props }: CardProps) {
    return (
        <div
            {...props}
            className={[interactive ? 'pilot-card pilot-card-interactive' : 'pilot-card', className].filter(Boolean).join(' ')}
            style={{
                backgroundColor: 'var(--surface-card)',
                border: 'var(--stroke-thin) solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: paddingMap[padding],
                color: 'var(--text-primary)',
                ...style,
            }}
        />
    );
}
