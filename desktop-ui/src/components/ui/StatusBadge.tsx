import { AlertCircle, CheckCircle2, Circle, Clock3, Loader2, PauseCircle, XCircle } from 'lucide-react';

export type StatusBadgeTone = 'ready' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed' | 'attention';

const badgeMeta = {
    ready: { label: 'Ready', color: 'var(--text-secondary)', bg: 'var(--surface-subtle)', Icon: Circle },
    running: { label: 'Running', color: 'var(--accent)', bg: 'var(--accent-soft)', Icon: Loader2 },
    paused: { label: 'Paused', color: 'var(--warning)', bg: 'var(--warning-soft)', Icon: PauseCircle },
    completed: { label: 'Completed', color: 'var(--success)', bg: 'var(--success-soft)', Icon: CheckCircle2 },
    stopped: { label: 'Stopped', color: 'var(--warning)', bg: 'var(--warning-soft)', Icon: Clock3 },
    failed: { label: 'Failed', color: 'var(--error)', bg: 'var(--error-soft)', Icon: XCircle },
    attention: { label: 'Needs attention', color: 'var(--warning)', bg: 'var(--warning-soft)', Icon: AlertCircle },
};

export function StatusBadge({ tone, label }: { tone: StatusBadgeTone; label?: string }) {
    const meta = badgeMeta[tone];
    const Icon = meta.Icon;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                width: 'fit-content',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 9px',
                backgroundColor: meta.bg,
                color: meta.color,
                fontSize: 'var(--type-caption-size)',
                fontWeight: 600,
                lineHeight: 'var(--type-caption-line)',
            }}
        >
            <Icon size={12} aria-hidden="true" className={tone === 'running' ? 'pilot-live-dot' : undefined} />
            {label ?? meta.label}
        </span>
    );
}
