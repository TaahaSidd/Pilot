import React, { useEffect, useRef } from 'react';
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
            case 'page': return '#33b5e5';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div style={{
            backgroundColor: '#050505',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            height: '320px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
            {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    &gt;_ Pipe idle. Awaiting engine transmission strings...
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log._id} style={{ display: 'flex', gap: '8px', lineHeight: '20px' }}>
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