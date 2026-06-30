// src/components/dashboard/StatsGrid.tsx
import React from 'react';
import { StatCard } from './StatCard';
import { ListChecks, Layers, Activity } from 'lucide-react';
import type { PilotStatus, CourseSummary } from '../../hooks/usePilot';

interface StatsGridProps {
    status: PilotStatus;
    statusError: string | null;
    configured: boolean;
    courses: CourseSummary[] | null;
    modulesCompletedThisRun: number;
}

const STATUS_LABEL: Record<PilotStatus, string> = {
    idle: 'Idle',
    running: 'Running',
    done: 'Completed',
    error: 'Failed',
};

export function StatsGrid({
    status,
    statusError,
    configured,
    courses,
    modulesCompletedThisRun,
}: StatsGridProps) {
    const coursesInProgress = courses
        ? courses.filter((c) => c.completion < 100).length
        : null;
    const coursesComplete = courses
        ? courses.filter((c) => c.completion === 100).length
        : null;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
            }}
        >
            {/* 1. Last run status — directly from /status, no fabrication */}
            <StatCard
                title="Last Run Status"
                value={!configured ? 'Not set up' : STATUS_LABEL[status]}
                icon={Activity}
                subtext={
                    status === 'error' && statusError ? (
                        <span style={{ color: 'var(--error)' }}>{statusError}</span>
                    ) : (
                        'Pulled live from the running agent'
                    )
                }
            />

            {/* 2. Course progress — from the real "summary" broadcast.
                 null courses means no run has reported a summary yet
                 this session — show an honest "—" rather than 0, since
                 0 would falsely imply "checked, none in progress." */}
            <StatCard
                title="Courses In Progress"
                value={coursesInProgress === null ? '—' : String(coursesInProgress)}
                icon={Layers}
                subtext={
                    coursesComplete === null
                        ? 'Run the agent to see live course data'
                        : `${coursesComplete} complete`
                }
            />

            {/* 3. Modules processed THIS SESSION — counts every module
                 event seen since the dashboard loaded, success or
                 failure. Deliberately labeled "Processed" not
                 "Completed": pilot_ui.py's log_module_progress fires
                 before success/failure is known, so we can't honestly
                 claim these all succeeded without a dedicated
                 success-only broadcast event. */}
            <StatCard
                title="Modules Processed"
                value={String(modulesCompletedThisRun)}
                icon={ListChecks}
                subtext="This session — includes retries/failures"
            />
        </div>
    );
}