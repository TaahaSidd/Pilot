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
                backgroundColor: 'var(--surface)',
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
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                }}
            >
                <span
                    style={{
                        fontSize: '12px',
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
                        gap: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        cursor: 'not-allowed',
                        opacity: 0.5,
                    }}
                >
                    <SlidersHorizontal size={12} /> Filter
                </button>
            </div>

            <div
                style={{
                    padding: '24px',
                    backgroundColor: 'var(--surface-subtle)',
                    height: '320px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                }}
            >
                {logs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Waiting for automation logs.
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
                                style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
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
