import { SlidersHorizontal } from 'lucide-react';
import type { LogEvent } from '../../hooks/usePilot';

interface LiveActivityLogProps {
    logs: LogEvent[];
    title?: string;
}

export function LiveActivityLog({ logs, title = 'Live Activity Log' }: LiveActivityLogProps) {
    return (
        <div
            style={{
                backgroundColor: 'var(--surface-card)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                flex: 1,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-card)',
                }}
            >
                <span
                    style={{
                        fontSize: 'var(--type-caption-size)',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        letterSpacing: 0,
                    }}
                >
                    {title}
                </span>

                <button
                    disabled
                    title="Coming soon"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--type-caption-size)',
                        cursor: 'not-allowed',
                        opacity: 0.5,
                    }}
                >
                    <SlidersHorizontal size={12} /> Filter
                </button>
            </div>

            <div
                style={{
                    padding: 'var(--space-6)',
                    backgroundColor: 'var(--surface-subtle)',
                    height: '320px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--type-body-small-size)',
                    lineHeight: '1.6',
                }}
            >
                {logs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Waiting for session logs.
                    </div>
                ) : (
                    logs.map((log) => {
                        const message =
                            typeof log.message === 'string'
                                ? log.message
                                : JSON.stringify(log.message);

                        return (
                            <div
                                key={log._id}
                                style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}
                            >
                                <span
                                    style={{
                                        color: 'var(--text-muted)',
                                        userSelect: 'none',
                                        minWidth: '75px',
                                    }}
                                >
                                    [--:--:--]
                                </span>
                                <span
                                    style={{
                                        color:
                                            log.level === 'error'
                                                ? 'var(--error)'
                                                : log.level === 'warning' || log.level === 'action_required'
                                                    ? 'var(--warning)'
                                                    : 'var(--text-primary)',
                                    }}
                                >
                                    {message}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
