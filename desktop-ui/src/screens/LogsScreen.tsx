import { useEffect, useState } from 'react';
import { LogFilterBar, type DateRangeFilter, type StatusFilter } from '../components/logs/LogFilterBar';
import { LogHistoryRow } from '../components/logs/LogHistoryRow';
import { Card, EmptyState, MessageBar, PageHeader } from '../components/ui';
import { HistorySkeleton } from '../components/shared/SkeletonScreens';
import { pilotApi, type HistorySessionSummary } from '../api/api';

function formatDate(iso: string | null) {
    if (!iso) return 'Unknown';
    return new Date(iso).toLocaleDateString();
}

function formatDuration(seconds: number | null) {
    if (seconds === null) return 'Unknown';

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

function getStatusFilter(status: string): StatusFilter {
    if (status === 'done') return 'success';
    if (status === 'stopped') return 'warning';
    if (status === 'error') return 'failed';
    if (status === 'running') return 'running';
    return 'warning';
}

function getSessionTitle(session: HistorySessionSummary) {
    const summary = session.summary as Record<string, unknown>;

    if (typeof summary.current_course === 'string') {
        return summary.current_course;
    }

    if (session.type === 'notes') return 'Notes generation';
    if (session.type === 'workflow') return 'Study session';

    return 'Pilot session';
}

function getSummary(session: HistorySessionSummary) {
    const summary = session.summary as Record<string, unknown>;

    if (session.type === 'notes') {
        const saved = summary.notes_saved ?? 0;
        const attempted = summary.notes_attempted ?? 0;
        return `${saved}/${attempted} notes saved`;
    }

    const processed = summary.modules_processed ?? summary.modules_started ?? 0;
    const total = summary.modules_total ?? 0;

    return total ? `${processed}/${total} topics studied` : `${processed} topics studied`;
}

function isInDateRange(iso: string | null, filter: DateRangeFilter) {
    if (filter === 'all') return true;
    if (!iso) return false;

    const startedAt = new Date(iso).getTime();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    if (filter === 'today') {
        return new Date(iso).toDateString() === new Date().toDateString();
    }

    if (filter === 'week') {
        return now - startedAt <= 7 * dayMs;
    }

    return now - startedAt <= 30 * dayMs;
}

export function LogsScreen({
    onOpenNotes,
    onResumeStudy,
    onOpenCourse,
}: {
    onOpenNotes?: () => void;
    onResumeStudy?: () => void;
    onOpenCourse?: () => void;
}) {
    const [sessions, setSessions] = useState<HistorySessionSummary[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filteredSessions = sessions.filter((session) => {
        const matchesStatus = statusFilter === 'all' || getStatusFilter(session.status) === statusFilter;
        const matchesDate = isInDateRange(session.started_at, dateRangeFilter);

        return matchesStatus && matchesDate;
    });

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
                    setError('Could not load recent sessions.');
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <PageHeader
                title="History"
                description="Review past study sessions, generated notes, and anything that needed attention."
            />

            {loading ? (
                <HistorySkeleton />
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <LogFilterBar
                    resultCount={filteredSessions.length}
                    statusFilter={statusFilter}
                    dateRangeFilter={dateRangeFilter}
                    onStatusChange={setStatusFilter}
                    onDateRangeChange={setDateRangeFilter}
                />

                <Card padding="sm" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 3.5fr 1.5fr 1.2fr 1fr',
                        padding: 'var(--space-3) var(--space-5)',
                        borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                        backgroundColor: 'var(--surface-subtle)',
                        fontSize: 'var(--type-caption-size)',
                        fontWeight: 650,
                        letterSpacing: 0,
                        color: 'var(--text-muted)'
                    }}>
                        <div>Date</div>
                        <div>Course / run</div>
                        <div>Summary</div>
                        <div>Time taken</div>
                        <div>Result</div>
                    </div>

                    {error && (
                        <div style={{ padding: 'var(--space-5)' }}>
                            <MessageBar tone="error" title="History could not load" message={error} />
                        </div>
                    )}

                    {!loading && !error && filteredSessions.length === 0 && (
                        <EmptyState
                            title={sessions.length === 0 ? 'No study sessions yet.' : 'No sessions match these filters.'}
                            message={sessions.length === 0
                                ? 'Start a study run or generate notes to build your session history.'
                                : 'Try a different status or date range.'}
                        />
                    )}

                    {!loading && !error && filteredSessions.map((session) => (
                        <LogHistoryRow
                            key={session.id}
                            sessionId={session.id}
                            date={formatDate(session.started_at)}
                            courseName={getSessionTitle(session)}
                            summary={getSummary(session)}
                            duration={formatDuration(session.duration_seconds)}
                            status={mapStatus(session.status)}
                            onOpenNotes={onOpenNotes}
                            onResumeStudy={onResumeStudy}
                            onOpenCourse={onOpenCourse}
                        />
                    ))}
                </Card>
            </div>
            )}
        </div>
    );
}
