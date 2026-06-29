// src/components/automation/LiveActivityLog.tsx
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { LogEvent } from '../../hooks/usePilot';

interface LiveActivityLogProps {
    logs: LogEvent[];
}

export function LiveActivityLog({ logs }: LiveActivityLogProps) {
    return (
        <div style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            backgroundColor: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flex: 1
        }}>
            {/* Functional Console Header Layout */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                        Live Activity Log
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>
                        <SlidersHorizontal size={12} /> Filter
                    </button>
                </div>
            </div>

            {/* Scrollable Log Output Terminal Block */}
            <div style={{
                padding: '24px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                height: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6'
            }}>
                {logs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Awaiting pipeline execution stream data payload...</div>
                ) : (
                    logs.map((log: any, index: number) => {
                        // Type defensive checking block: If your hook pipes plain strings, parse elegantly
                        const isObject = log && typeof log === 'object';
                        const messageText = isObject ? (log.message || '') : String(log);
                        const logTime = isObject && log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
                        const logType = isObject ? log.type : 'info';
                        const rowKey = isObject && log.id ? log.id : index;

                        return (
                            <div key={rowKey} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--text-muted)', userSelect: 'none', minWidth: '75px' }}>
                                    [{logTime}]
                                </span>
                                <span style={{
                                    color: logType === 'error' ? '#ff4444' : logType === 'warning' ? '#ffbb33' : 'var(--text-primary)'
                                }}>
                                    {/* Safely rendering string representations to keep ReactNode happy */}
                                    {typeof messageText === 'string' ? messageText : JSON.stringify(messageText)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}