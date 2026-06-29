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
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    disabled,
    ...props
}: ButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Color matrix design tokens mapping dashboard context styles
    const getVariantStyles = () => {
        if (disabled) {
            return {
                bg: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)'
            };
        }
        switch (variant) {
            case 'secondary':
                return {
                    bg: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    hoverBg: 'rgba(255, 255, 255, 0.07)'
                };
            case 'danger':
                return {
                    bg: 'rgba(255, 68, 68, 0.1)',
                    color: '#ff4444',
                    border: '1px solid rgba(255, 68, 68, 0.2)',
                    hoverBg: 'rgba(255, 68, 68, 0.18)'
                };
            case 'ghost':
                return {
                    bg: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                    hoverBg: 'rgba(255, 255, 255, 0.03)'
                };
            case 'outline':
                return {
                    bg: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    hoverBg: 'rgba(255, 255, 255, 0.02)'
                };
            default: // Primary
                return {
                    bg: 'var(--accent)',
                    color: '#ffffff',
                    border: '1px solid transparent',
                    hoverBg: '#9333ea' // Deep matching highlight purple
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
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => !disabled && setIsHovered(false)}
            disabled={disabled}
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
                cursor: disabled ? 'not-allowed' : 'pointer',
                width: fullWidth ? '100%' : 'auto',
                transition: 'all 150ms ease',
                fontFamily: 'inherit',
                outline: 'none',
                opacity: disabled ? 0.6 : 1,
                ...style
            }}
            {...props}
        >
            {Icon && iconPosition === 'left' && <Icon size={sStyle.iconSize} style={{ flexShrink: 0 }} />}
            <span>{children}</span>
            {Icon && iconPosition === 'right' && <Icon size={sStyle.iconSize} style={{ flexShrink: 0 }} />}
        </button>
    );
}