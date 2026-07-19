import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type MessageTone = 'info' | 'success' | 'warning' | 'error';

const messageMeta = {
    info: { Icon: Info, color: 'var(--color-status-info)', bg: 'var(--color-status-info-soft)' },
    success: { Icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-soft)' },
    warning: { Icon: TriangleAlert, color: 'var(--warning)', bg: 'var(--warning-soft)' },
    error: { Icon: AlertCircle, color: 'var(--error)', bg: 'var(--error-soft)' },
};

export function MessageBar({
    tone = 'info',
    title,
    message,
    actions,
}: {
    tone?: MessageTone;
    title: string;
    message?: string;
    actions?: ReactNode;
}) {
    const meta = messageMeta[tone];
    const Icon = meta.Icon;

    return (
        <div
            role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--space-4)',
                borderRadius: 'var(--radius-card)',
                border: `var(--stroke-thin) solid color-mix(in srgb, ${meta.color} 34%, var(--border-subtle))`,
                backgroundColor: meta.bg,
                padding: 'var(--space-4)',
            }}
        >
            <div style={{ display: 'flex', gap: 'var(--space-3)', minWidth: 0 }}>
                <Icon size={18} color={meta.color} aria-hidden="true" />
                <div>
                    <div style={{ color: meta.color, fontWeight: 700 }}>{title}</div>
                    {message && <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--text-secondary)' }}>{message}</p>}
                </div>
            </div>
            {actions}
        </div>
    );
}
