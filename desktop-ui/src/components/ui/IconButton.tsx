import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    label: string;
    size?: 'sm' | 'md';
}

export function IconButton({ icon: Icon, label, size = 'md', style, ...props }: IconButtonProps) {
    const dimension = size === 'sm' ? '32px' : '38px';
    const iconSize = size === 'sm' ? 16 : 18;

    return (
        <button
            {...props}
            type={props.type ?? 'button'}
            aria-label={label}
            title={label}
            className={['pilot-inline-button', props.className].filter(Boolean).join(' ')}
            style={{
                width: dimension,
                height: dimension,
                borderRadius: 'var(--radius-control)',
                border: 'var(--stroke-thin) solid var(--border-subtle)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.55 : 1,
                ...style,
            }}
        >
            <Icon size={iconSize} aria-hidden="true" />
        </button>
    );
}
