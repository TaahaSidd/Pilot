import { ListChecks, Layers, Timer } from 'lucide-react';
import { StatCard } from './StatCard';
import type { PilotStatus, CourseSummary, RuntimeState } from '../../hooks/usePilot';

interface StatsGridProps {
    status: PilotStatus;
    runtime: RuntimeState | null;
    courses: CourseSummary[] | null;
    modulesCompletedThisRun: number;
}

function formatElapsed(seconds: number | null | undefined) {
    if (!seconds) return '0s';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins < 1) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

function getElapsedProgress(runtime: RuntimeState | null) {
    if (runtime?.modules_total) {
        return Math.max(0, Math.min(runtime.module_progress_percent, 100));
    }

    const seconds = runtime?.elapsed_seconds ?? 0;
    return Math.max(0, Math.min((seconds / 1800) * 100, 100));
}

function ElapsedProgress({ percent, isRunning }: { percent: number; isRunning: boolean }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            <div
                aria-label="Elapsed progress"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    height: '14px',
                    padding: '3px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                }}
            >
                {[0, 1, 2, 3].map((segment) => {
                    const segmentStart = segment * 25;
                    const fill = Math.max(0, Math.min((percent - segmentStart) / 25, 1));

                    return (
                        <div
                            key={segment}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '999px',
                                backgroundColor: 'var(--border)',
                            }}
                        >
                            <div
                                style={{
                                    width: `${fill * 100}%`,
                                    height: '100%',
                                    borderRadius: '999px',
                                    backgroundColor: 'var(--accent)',
                                    transition: 'width 180ms ease',
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <span>
                {isRunning ? `${Math.round(percent)}% run progress` : 'Last tracked run'}
            </span>
        </div>
    );
}

function SegmentedProgress({ percent, label }: { percent: number; label: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            <div
                aria-label={label}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(16, 1fr)',
                    gap: '4px',
                    height: '28px',
                    alignItems: 'stretch',
                }}
            >
                {Array.from({ length: 16 }).map((_, index) => {
                    const segmentPercent = ((index + 1) / 16) * 100;
                    const isFilled = percent >= segmentPercent;

                    return (
                        <span
                            key={index}
                            style={{
                                borderRadius: '999px',
                                backgroundColor: isFilled ? 'var(--accent)' : 'var(--surface-subtle)',
                                border: isFilled ? '1px solid var(--accent)' : '1px solid var(--border)',
                                boxShadow: isFilled ? '0 0 0 1px var(--accent-soft)' : 'none',
                                transition: 'background-color 180ms ease, border-color 180ms ease',
                            }}
                        />
                    );
                })}
            </div>

            <span>{label}</span>
        </div>
    );
}

function CourseProgress({ percent, label }: { percent: number; label: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            <div
                aria-label="Course progress"
                style={{
                    width: '100%',
                    height: '14px',
                    padding: '3px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: '999px',
                        backgroundColor: 'var(--accent)',
                        transition: 'width 180ms ease',
                    }}
                />
            </div>

            <span>{label}</span>
        </div>
    );
}

export function StatsGrid({
    status,
    runtime,
    courses,
    modulesCompletedThisRun,
}: StatsGridProps) {
    const isRunning = status === 'running';

    const coursesInProgress = courses
        ? courses.filter((course) => course.completion < 100).length
        : null;

    const coursesComplete = courses
        ? courses.filter((course) => course.completion === 100).length
        : null;

    const courseTotal = courses?.length ?? 0;
    const coursesInProgressValue = coursesInProgress === null
        ? '0/0'
        : `${coursesInProgress}/${courseTotal}`;
    const courseProgressPercent = courseTotal > 0
        ? Math.round((coursesInProgress / courseTotal) * 100)
        : 0;
    const courseProgressLabel = coursesComplete === null
        ? 'Run the agent to see live course data'
        : `${coursesComplete} complete`;

    const modulesValue = runtime?.modules_total
        ? `${runtime.modules_processed}/${runtime.modules_total}`
        : String(modulesCompletedThisRun);

    const modulesSubtext = runtime?.modules_total
        ? `${runtime.module_progress_percent}% processed`
        : 'This session includes retries and failures';

    const elapsedProgress = getElapsedProgress(runtime);
    const modulesProgress = runtime?.modules_total ? runtime.module_progress_percent : 0;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
                gap: '16px',
                minWidth: 0,
            }}
        >
            <StatCard
                title="Courses In Progress"
                value={coursesInProgressValue}
                icon={Layers}
                subtext={<CourseProgress percent={courseProgressPercent} label={courseProgressLabel} />}
            />

            <StatCard
                title={runtime?.run_type === 'notes' ? 'Notes Progress' : 'Modules Processed'}
                value={modulesValue}
                icon={ListChecks}
                subtext={<SegmentedProgress percent={modulesProgress} label={modulesSubtext} />}
            />

            <StatCard
                title="Elapsed Time"
                value={formatElapsed(runtime?.elapsed_seconds)}
                icon={Timer}
                subtext={<ElapsedProgress percent={elapsedProgress} isRunning={isRunning} />}
            />
        </div>
    );
}
