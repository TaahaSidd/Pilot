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
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--surface)',
            flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                    style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '999px',
                        backgroundColor: connected ? 'var(--success)' : 'var(--error)',
                        boxShadow: connected ? '0 0 8px rgba(34, 197, 94, 0.45)' : 'none',
                    }}
                />
                <span>Engine</span>
                <strong style={{
                    color: connected ? 'var(--success)' : 'var(--error)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                }}>
                    {connected ? 'connected' : 'disconnected'}
                </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Mode:</span>
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
