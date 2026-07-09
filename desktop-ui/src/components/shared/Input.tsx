// src/components/shared/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

export function Input({ label, description, type = 'text', ...props }: InputProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
            <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
                {description && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{description}</span>}
            </div>

            <input
                {...props}
                type={type}
                style={{
                    flex: 1,
                    backgroundColor: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                }}
            />
        </div>
    );
}
