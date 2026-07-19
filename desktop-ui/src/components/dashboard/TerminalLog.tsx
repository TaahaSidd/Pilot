import { useEffect, useRef } from 'react';
import type { LogEvent } from '../../hooks/usePilot';

interface TerminalLogProps {
    logs: LogEvent[];
}

export function TerminalLog({ logs }: TerminalLogProps) {
    const terminalEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getColorByLevel = (level: string) => {
        switch (level) {
            case 'error': return 'var(--error)';
            case 'warning': return 'var(--warning)';
            case 'success': return 'var(--success)';
            case 'page': return 'var(--info)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--surface-overlay)',
            border: 'var(--stroke-thin) solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--type-body-small-size)',
            height: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
        }}>
            {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Waiting for session logs.
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log._id} style={{ display: 'flex', gap: 'var(--space-2)', lineHeight: '20px' }}>
                        <span style={{ color: getColorByLevel(log.level), fontWeight: 600 }}>
                            [{log.level.toUpperCase()}]
                        </span>
                        <span style={{ color: 'var(--text-primary)' }}>
                            {typeof log.message === 'string' ? log.message : JSON.stringify(log.message)}
                        </span>
                    </div>
                ))
            )}
            <div ref={terminalEndRef} />
        </div>
    );
}
