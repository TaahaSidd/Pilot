import React from 'react';
import { LogFilterBar } from '../components/logs/LogFilterBar';
import { LogHistoryRow } from '../components/logs/LogHistoryRow';

export function LogsScreen() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Context Heading */}
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Activity Archive
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    View a history of your past automation sessions, including performance metrics and completed tasks.
                </p>
            </div>

            {/* Structured Table Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <LogFilterBar />

                <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
                    {/* Header Columns */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 3.5fr 1.2fr 1.2fr 1fr',
                        padding: '12px 20px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)'
                    }}>
                        <div>Date</div>
                        <div>Course / Project</div>
                        <div>Summary</div>
                        <div>Time Taken</div>
                        <div>Result</div>
                    </div>

                    {/* Archived Items - Updated props to lowercase status */}
                    <LogHistoryRow
                        date="2026-06-29"
                        courseName="Advanced Machine Learning Architecture"
                        badges={['ML', 'DS']}
                        extraBadgesCount={3}
                        duration="02h 45m"
                        status="Success"
                    />
                    <LogHistoryRow
                        date="2026-06-28"
                        courseName="Cybersecurity Fundamentals: Network Protocols"
                        badges={['CS', 'NP']}
                        duration="01h 12m"
                        status="Warning"
                    />
                    <LogHistoryRow
                        date="2026-06-27"
                        courseName="Fullstack Web Development | React & GraphQL"
                        badges={['FS', 'GG']}
                        extraBadgesCount={8}
                        duration="05h 30m"
                        status="Success"
                    />
                </div>
            </div>
        </div>
    );
}