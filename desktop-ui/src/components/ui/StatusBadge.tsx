export type StatusBadgeTone = 'ready' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed' | 'attention';

const badgeMeta = {
    ready: { label: 'Ready', color: 'var(--text-secondary)', bg: 'var(--surface-subtle)' },
    running: { label: 'Running', color: 'var(--accent)', bg: 'var(--accent-soft)' },
    paused: { label: 'Paused', color: 'var(--warning)', bg: 'var(--warning-soft)' },
    completed: { label: 'Completed', color: 'var(--success)', bg: 'var(--success-soft)' },
    stopped: { label: 'Stopped', color: 'var(--warning)', bg: 'var(--warning-soft)' },
    failed: { label: 'Failed', color: 'var(--error)', bg: 'var(--error-soft)' },
    attention: { label: 'Needs attention', color: 'var(--warning)', bg: 'var(--warning-soft)' },
};

export function StatusBadge({ tone, label }: { tone: StatusBadgeTone; label?: string }) {
    const meta = badgeMeta[tone];

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
            {label ?? meta.label}
        </span>
    );
}
