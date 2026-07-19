// src/components/shared/Button.tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    loading?: boolean;
    loadingText?: string;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    loading = false,
    loadingText,
    style,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const getVariantStyles = () => {
        if (disabled && !loading) {
            return {
                bg: 'var(--surface-subtle)',
                color: 'var(--text-disabled)',
                border: 'var(--stroke-thin) solid var(--border)'
            };
        }
        switch (variant) {
            case 'secondary':
                return {
                    bg: 'var(--surface-subtle)',
                    color: 'var(--text-secondary)',
                    border: 'var(--stroke-thin) solid var(--border)',
                    hoverBg: 'var(--surface-overlay)'
                };
            case 'danger':
                return {
                    bg: 'var(--error)',
                    color: 'var(--text-on-accent)',
                    border: 'var(--stroke-thin) solid transparent',
                    hoverBg: 'var(--error-hover)'
                };
            case 'ghost':
                return {
                    bg: 'transparent',
                    color: 'var(--text-muted)',
                    border: 'var(--stroke-thin) solid transparent',
                    hoverBg: 'var(--surface-subtle)'
                };
            case 'outline':
                return {
                    bg: 'transparent',
                    color: 'var(--text-primary)',
                    border: 'var(--stroke-thin) solid var(--border)',
                    hoverBg: 'var(--surface-subtle)'
                };
            default: // Primary
                return {
                    bg: 'var(--accent)',
                    color: 'var(--text-on-accent)',
                    border: 'var(--stroke-thin) solid transparent',
                    hoverBg: 'var(--accent-hover)'
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { padding: '6px 12px', fontSize: '12px', gap: '6px', iconSize: 13, minHeight: '32px' };
            case 'lg': return { padding: '12px 24px', fontSize: '15px', gap: '10px', iconSize: 18, minHeight: '44px' };
            default: return { padding: '9px 16px', fontSize: '13px', gap: '8px', iconSize: 15, minHeight: '38px' };
        }
    };

    const vStyle = getVariantStyles();
    const sStyle = getSizeStyles();

    return (
        <button
            {...props}
            className={['pilot-button', className].filter(Boolean).join(' ')}
            data-variant={variant}
            data-loading={loading ? 'true' : undefined}
            disabled={isDisabled}
            aria-busy={loading}
            style={{
                '--pilot-button-bg': vStyle.bg,
                '--pilot-button-hover-bg': vStyle.hoverBg ?? vStyle.bg,
                '--pilot-button-color': vStyle.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sStyle.gap,
                padding: sStyle.padding,
                minHeight: sStyle.minHeight,
                fontSize: sStyle.fontSize,
                fontWeight: 600,
                lineHeight: '18px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--pilot-button-bg)',
                color: vStyle.color,
                border: vStyle.border,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                width: fullWidth ? '100%' : 'auto',
                fontFamily: 'inherit',
                outline: 'none',
                opacity: isDisabled ? 0.6 : 1,
                ...style
            } as React.CSSProperties}
        >
            {loading && (
                <>
                    <span
                        style={{
                            width: sStyle.iconSize,
                            height: sStyle.iconSize,
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '999px',
                            flexShrink: 0,
                            animation: 'pilot-spin 700ms linear infinite',
                        }}
                    />
                </>
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon size={sStyle.iconSize} style={{ flexShrink: 0 }} />}
            <span className="pilot-button-label">{loading && loadingText ? loadingText : children}</span>
            {!loading && Icon && iconPosition === 'right' && <Icon size={sStyle.iconSize} style={{ flexShrink: 0 }} />}
        </button>
    );
}
