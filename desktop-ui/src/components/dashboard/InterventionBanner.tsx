import { AlertCircle, AlertTriangle, X } from 'lucide-react';

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
        <div style={{
            border: `1px solid ${color}`,
            backgroundColor,
            padding: '16px',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Icon size={18} style={{ color, marginTop: '2px', flex: '0 0 auto' }} />
                <div>
                    <h4 style={{ color, fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                        {title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '19px', margin: 0 }}>
                        {message}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
                {secondaryAction && (
                    <button
                        type="button"
                        onClick={secondaryAction.onClick}
                        style={{
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            padding: '9px 12px',
                            borderRadius: '7px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        {secondaryAction.label}
                    </button>
                )}

                {primaryAction && (
                    <button
                        type="button"
                        onClick={primaryAction.onClick}
                        style={{
                            backgroundColor: color,
                            color: 'var(--text-on-accent)',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '7px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                        }}
                    >
                        {primaryAction.label}
                    </button>
                )}

                {dismissible && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        title="Dismiss"
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '7px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={15} />
                    </button>
                )}
            </div>
        </div>
    );
}
