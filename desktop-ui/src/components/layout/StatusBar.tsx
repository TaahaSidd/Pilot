// src/components/layout/StatusBar.tsx

interface StatusBarProps {
    wsState: string;
    status: string;
}

export function StatusBar({ wsState, status }: StatusBarProps) {
    const connected = wsState === 'open';

    return (
        <footer style={{
            height: '30px',
            borderTop: 'var(--stroke-thin) solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-4, 16px)',
            fontSize: 'var(--type-label-size)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--surface)',
            flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2, 8px)' }}>
                <span
                    style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: connected ? 'var(--success)' : 'var(--error)',
                        boxShadow: connected ? '0 0 0 4px var(--success-soft)' : 'none',
                    }}
                />
                <strong style={{
                    color: connected ? 'var(--success)' : 'var(--error)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                }}>
                    {connected ? 'Ready' : 'Offline'}
                </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2, 8px)' }}>
                <span>Run:</span>
                <strong style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                }}>
                    {status || 'idle'}
                </strong>
            </div>
        </footer>
    );
}
