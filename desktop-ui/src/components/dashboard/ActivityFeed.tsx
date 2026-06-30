// src/components/dashboard/ActivityFeed.tsx
import React, { useState } from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '../shared/Button';
import type { LogEvent, LogLevel } from '../../hooks/usePilot';

interface ActivityFeedProps {
    logs: LogEvent[];
}

const PAGE_SIZE = 8;

function getIcon(level: LogLevel) {
    switch (level) {
        case 'success':
        case 'course':
            return <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />;
        case 'error':
            return <AlertCircle size={16} style={{ color: 'var(--error)', marginTop: '2px', flexShrink: 0 }} />;
        case 'warning':
        case 'action_required':
            return <AlertTriangle size={16} style={{ color: 'var(--warning)', marginTop: '2px', flexShrink: 0 }} />;
        default:
            return <FileSpreadsheet size={16} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />;
    }
}

function messageToText(message: LogEvent['message']): string {
    if (typeof message === 'string') return message;
    // "summary" events carry an array of {title, completion} — not
    // meaningful as a single activity line, so this feed skips them
    // (filtered out before rendering, see below)
    return JSON.stringify(message);
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // newest first, and skip "summary" (structured course-list data,
    // not a single human-readable activity line — CourseGrid already
    // renders that data properly elsewhere)
    const items = [...logs].reverse().filter((l) => l.level !== 'summary');
    const visible = items.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + PAGE_SIZE);
    };

    return (
        <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', marginTop: 0 }}>
                Recent Activity
            </h3>
            <div
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                }}
            >
                {items.length === 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px 0' }}>
                        No activity yet this session. Start a run to see live updates here.
                    </div>
                )}

                {visible.map((entry) => (
                    <div key={entry._id} style={{ display: 'flex', gap: '14px', fontSize: '13px' }}>
                        {getIcon(entry.level)}
                        <div>
                            <div style={{ color: 'var(--text-primary)', lineHeight: '18px' }}>
                                {messageToText(entry.message)}
                            </div>
                        </div>
                    </div>
                ))}

                {visibleCount < items.length && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={ChevronDown}
                            iconPosition="right"
                            fullWidth
                            onClick={handleLoadMore}
                            style={{ color: 'var(--text-muted)', fontSize: '12px' }}
                        >
                            View Older Activity
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}