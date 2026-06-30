// src/components/automation/LiveActivityLog.tsx
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { LogEvent } from '../../hooks/usePilot';

interface LiveActivityLogProps {
    logs: LogEvent[];
}

export function LiveActivityLog({ logs }: LiveActivityLogProps) {
    return (
        <div
            style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Live Activity Log
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Filter button currently has no behavior wired —
                        left as a visual placeholder, not claiming to work */}
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
            </div>

            <div
                style={{
                    padding: '24px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
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
                        Awaiting pipeline execution stream data payload...
                    </div>
                ) : (
                    logs.map((log) => {
                        const messageText =
                            typeof log.message === 'string'
                                ? log.message
                                : JSON.stringify(log.message);

                        // There is currently no real timestamp anywhere
                        // in the broadcast pipeline (pilot_ui.py's
                        // _broadcast() doesn't attach one). Rather than
                        // fabricate "now" and imply it's accurate, show
                        // an explicit placeholder. To get real
                        // timestamps, _broadcast() needs a small addition
                        // server-side — flagged, not silently faked.
                        const logTime = '—:—:—';

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
                                    [{logTime}]
                                </span>
                                <span
                                    style={{
                                        color:
                                            log.level === 'error'
                                                ? '#ff4444'
                                                : log.level === 'warning' || log.level === 'action_required'
                                                    ? '#ffbb33'
                                                    : 'var(--text-primary)',
                                    }}
                                >
                                    {messageText}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}