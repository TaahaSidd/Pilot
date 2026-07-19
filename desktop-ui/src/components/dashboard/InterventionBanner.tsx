import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Button, IconButton } from '../ui';

interface InterventionBannerProps {
    title: string;
    message: string;
    severity?: 'warning' | 'error';
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    dismissible?: boolean;
    onDismiss?: () => void;
}

export function InterventionBanner({
    title,
    message,
    severity = 'warning',
    primaryAction,
    secondaryAction,
    dismissible = false,
    onDismiss,
}: InterventionBannerProps) {
    const color = severity === 'error' ? 'var(--error)' : 'var(--warning)';
    const backgroundColor = severity === 'error' ? 'var(--error-soft)' : 'var(--warning-soft)';
    const Icon = severity === 'error' ? AlertCircle : AlertTriangle;

    return (
        <div className="pilot-attention-banner" style={{
            border: `var(--stroke-thin) solid ${color}`,
            backgroundColor,
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
        }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', minWidth: 0 }}>
                <Icon size={18} style={{ color, marginTop: '2px', flex: '0 0 auto' }} />
                <div style={{ minWidth: 0 }}>
                    <h4 style={{ color, fontWeight: 700, fontSize: 'var(--type-body-size)', margin: '0 0 var(--space-1)' }}>
                        {title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--type-body-small-size)', lineHeight: 'var(--type-body-small-line)', margin: 0 }}>
                        {message}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 0 auto' }}>
                {secondaryAction && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={secondaryAction.onClick}
                    >
                        {secondaryAction.label}
                    </Button>
                )}

                {primaryAction && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={primaryAction.onClick}
                        style={{
                            '--pilot-button-bg': color,
                            '--pilot-button-hover-bg': color,
                            '--pilot-button-color': 'var(--text-on-accent)',
                        } as CSSProperties}
                    >
                        {primaryAction.label}
                    </Button>
                )}

                {dismissible && (
                    <IconButton
                        icon={X}
                        label="Dismiss"
                        size="sm"
                        onClick={onDismiss}
                    />
                )}
            </div>
        </div>
    );
}
