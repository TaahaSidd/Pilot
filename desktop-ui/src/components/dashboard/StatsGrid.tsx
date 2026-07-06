// src/components/dashboard/StatsGrid.tsx
import React from 'react';
import { StatCard } from './StatCard';
import { ListChecks, Layers, Activity, Timer } from 'lucide-react';
import type { PilotStatus, CourseSummary, RuntimeState } from '../../hooks/usePilot';

interface StatsGridProps {
    status: PilotStatus;
    statusError: string | null;
    configured: boolean;
    runtime: RuntimeState | null;
    courses: CourseSummary[] | null;
    modulesCompletedThisRun: number;
}

const STATUS_LABEL: Record<PilotStatus, string> = {
    idle: 'Idle',
    running: 'Running',
    done: 'Completed',
    stopped: 'Stopped',
    error: 'Failed',
};

function formatElapsed(seconds: number | null | undefined) {
    if (!seconds) return '—';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins < 1) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

export function StatsGrid({
    status,
    statusError,
    configured,
    runtime,
    courses,
    modulesCompletedThisRun,
}: StatsGridProps) {
    const isRunning = status === 'running';

    const coursesInProgress = courses
        ? courses.filter((c) => c.completion < 100).length
        : null;

    const coursesComplete = courses
        ? courses.filter((c) => c.completion === 100).length
        : null;

    const modulesValue = runtime?.modules_total
        ? `${runtime.modules_processed}/${runtime.modules_total}`
        : String(modulesCompletedThisRun);

    const modulesSubtext = runtime?.modules_total
        ? `${runtime.module_progress_percent}% processed`
        : 'This session — includes retries/failures';

    const statusSubtext =
        status === 'error' && statusError ? (
            <span style={{ color: 'var(--error)' }}>{statusError}</span>
        ) : isRunning && runtime?.current_action_label ? (
            runtime.current_action_label
        ) : (
            'Pulled live from the running agent'
        );

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
            }}
        >
            <StatCard
                title={isRunning ? 'Current Status' : 'Last Run Status'}
                value={!configured ? 'Not set up' : STATUS_LABEL[status]}
                icon={Activity}
                subtext={statusSubtext}
            />

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

            <StatCard
                title={runtime?.run_type === 'notes' ? 'Notes Progress' : 'Modules Processed'}
                value={modulesValue}
                icon={ListChecks}
                subtext={modulesSubtext}
            />

            <StatCard
                title="Elapsed Time"
                value={formatElapsed(runtime?.elapsed_seconds)}
                icon={Timer}
                subtext={isRunning ? 'Current run duration' : 'Last tracked run'}
            />
        </div>
    );
}