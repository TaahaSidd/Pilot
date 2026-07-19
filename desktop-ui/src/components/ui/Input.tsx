import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: ReactNode;
    error?: ReactNode;
}

export function Input({ label, helperText, error, id, style, ...props }: InputProps) {
    const inputId = id ?? props.name;
    const message = error ?? helperText;

    return (
        <label style={{ display: 'grid', gap: 'var(--space-2)', color: 'var(--text-primary)' }}>
            {label && (
                <span className="pilot-type-label" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </span>
            )}
            <input
                {...props}
                id={inputId}
                aria-invalid={Boolean(error)}
                style={{
                    minHeight: '42px',
                    borderRadius: 'var(--radius-control)',
                    border: `var(--stroke-thin) solid ${error ? 'var(--error)' : 'var(--border)'}`,
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    padding: '0 var(--space-4)',
                    outline: 'none',
                    ...style,
                }}
            />
            {message && (
                <span style={{ color: error ? 'var(--error)' : 'var(--text-muted)', fontSize: 'var(--type-caption-size)', lineHeight: 'var(--type-caption-line)' }}>
                    {message}
                </span>
            )}
        </label>
    );
}
