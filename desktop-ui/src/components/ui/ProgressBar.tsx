interface ProgressBarProps {
    value: number;
    label?: string;
    tone?: 'accent' | 'success';
    height?: string;
}

export function ProgressBar({ value, label, tone = 'accent', height = '8px' }: ProgressBarProps) {
    const safeValue = Math.max(0, Math.min(100, value));
    const fillColor = tone === 'success' ? 'var(--success)' : 'var(--accent)';

    return (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {label && (
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--type-label-size)', lineHeight: 'var(--type-label-line)' }}>
                    {label}
                </div>
            )}
            <div
                role="progressbar"
                aria-valuenow={safeValue}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{
                    height,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--surface-subtle)',
                    border: 'var(--stroke-thin) solid var(--border-subtle)',
                    overflow: 'hidden',
                }}
            >
                <div
                    className="pilot-progress-fill"
                    style={{
                        width: `${safeValue}%`,
                        height: '100%',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: fillColor,
                    }}
                />
            </div>
        </div>
    );
}
