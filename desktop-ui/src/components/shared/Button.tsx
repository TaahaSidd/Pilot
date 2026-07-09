// src/components/shared/Button.tsx
import React, { useState } from 'react';
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
    disabled,
    ...props
}: ButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isDisabled = disabled || loading;

    // Color matrix design tokens mapping dashboard context styles
    const getVariantStyles = () => {
        if (disabled && !loading) {
            return {
                bg: 'var(--surface-subtle)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)'
            };
        }
        switch (variant) {
            case 'secondary':
                return {
                    bg: 'var(--surface-subtle)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    hoverBg: 'var(--surface-overlay)'
                };
            case 'danger':
                return {
                    bg: 'var(--error)',
                    color: 'var(--text-on-accent)',
                    border: '1px solid transparent',
                    hoverBg: 'var(--error-hover)'
                };
            case 'ghost':
                return {
                    bg: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                    hoverBg: 'var(--surface-subtle)'
                };
            case 'outline':
                return {
                    bg: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    hoverBg: 'var(--surface-subtle)'
                };
            default: // Primary
                return {
                    bg: 'var(--accent)',
                    color: 'var(--text-on-accent)',
                    border: '1px solid transparent',
                    hoverBg: 'var(--accent-hover)'
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { padding: '6px 12px', fontSize: '12px', gap: '6px', iconSize: 13 };
            case 'lg': return { padding: '12px 24px', fontSize: '15px', gap: '10px', iconSize: 18 };
            default: return { padding: '9px 16px', fontSize: '13px', gap: '8px', iconSize: 15 };
        }
    };

    const vStyle = getVariantStyles();
    const sStyle = getSizeStyles();

    return (
        <button
            {...props}
            onMouseEnter={() => !isDisabled && setIsHovered(true)}
            onMouseLeave={() => !isDisabled && setIsHovered(false)}
            onFocus={(event) => {
                setIsFocused(true);
                props.onFocus?.(event);
            }}
            onBlur={(event) => {
                setIsFocused(false);
                props.onBlur?.(event);
            }}
            disabled={isDisabled}
            aria-busy={loading}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sStyle.gap,
                padding: sStyle.padding,
                fontSize: sStyle.fontSize,
                fontWeight: 500,
                borderRadius: '6px',
                backgroundColor: isHovered && vStyle.hoverBg ? vStyle.hoverBg : vStyle.bg,
                color: vStyle.color,
                border: vStyle.border,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                width: fullWidth ? '100%' : 'auto',
                transition: 'all 150ms ease',
                fontFamily: 'inherit',
                outline: isFocused ? '2px solid var(--accent)' : 'none',
                outlineOffset: '2px',
                opacity: isDisabled ? 0.6 : 1,
                ...style
            }}
        >
            {loading && (
                <>
                    <style>
                        {'@keyframes pilot-button-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}
                    </style>
                    <span
                        style={{
                            width: sStyle.iconSize,
                            height: sStyle.iconSize,
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '999px',
                            flexShrink: 0,
                            animation: 'pilot-button-spin 700ms linear infinite',
                        }}
                    />
                </>
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon size={sStyle.iconSize} style={{ flexShrink: 0 }} />}
            <span>{loading && loadingText ? loadingText : children}</span>
            {!loading && Icon && iconPosition === 'right' && <Icon size={sStyle.iconSize} style={{ flexShrink: 0 }} />}
        </button>
    );
}
