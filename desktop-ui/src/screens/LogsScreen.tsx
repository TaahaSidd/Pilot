import React, { useEffect, useState } from 'react';
import { LogFilterBar } from '../components/logs/LogFilterBar';
import { LogHistoryRow } from '../components/logs/LogHistoryRow';
import { pilotApi, type HistorySessionSummary } from '../api/api';

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
}

function formatDuration(seconds: number | null) {
    if (seconds === null) return '—';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins < 1) return `${secs}s`;
    if (mins < 60) return `${mins}m ${secs}s`;

    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
}

type RowStatus = 'Success' | 'Warning' | 'Failed' | 'Running';

function mapStatus(status: string): RowStatus {
    if (status === 'done') return 'Success';
    if (status === 'stopped') return 'Warning';
    if (status === 'error') return 'Failed';
    if (status === 'running') return 'Running';
    return 'Warning';
}

function getSessionTitle(session: HistorySessionSummary) {
    const summary = session.summary as Record<string, unknown>;

    if (typeof summary.current_course === 'string') {
        return summary.current_course;
    }

    if (session.type === 'notes') return 'Notes Generation';
    if (session.type === 'workflow') return 'Workflow Automation';

    return 'Pilot Session';
}

function getBadges(session: HistorySessionSummary) {
    const badges = [session.type.toUpperCase()];

    if (session.status === 'stopped') badges.push('STOP');
    if (session.status === 'error') badges.push('ERR');

    return badges;
}

function getSummary(session: HistorySessionSummary) {
    const summary = session.summary as Record<string, unknown>;

    if (session.type === 'notes') {
        const saved = summary.notes_saved ?? 0;
        const attempted = summary.notes_attempted ?? 0;
        return `${saved}/${attempted} notes`;
    }

    const processed = summary.modules_processed ?? summary.modules_started ?? 0;
    const total = summary.modules_total ?? 0;

    return total ? `${processed}/${total} modules` : `${processed} modules`;
}

export function LogsScreen() {
    const [sessions, setSessions] = useState<HistorySessionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            try {
                setLoading(true);
                const data = await pilotApi.getHistory();

                if (!cancelled) {
                    setSessions(data);
                    setError(null);
                }
            } catch {
                if (!cancelled) {
                    setError('Could not load activity history.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Activity Archive
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    View a history of your past automation sessions, including performance metrics and completed tasks.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <LogFilterBar resultCount={sessions.length} />

                <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255,255,255,0.01)'
                }}>
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

                    {loading && (
                        <div style={{ padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Loading history…
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '24px', color: 'var(--error)', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && sessions.length === 0 && (
                        <div style={{ padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            No activity history yet.
                        </div>
                    )}

                    {!loading && !error && sessions.map((session) => (
                        <LogHistoryRow
                            key={session.id}
                            sessionId={session.id}
                            date={formatDate(session.started_at)}
                            courseName={getSessionTitle(session)}
                            badges={getBadges(session)}
                            duration={formatDuration(session.duration_seconds)}
                            status={mapStatus(session.status)}
                            extraBadgesCount={0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}