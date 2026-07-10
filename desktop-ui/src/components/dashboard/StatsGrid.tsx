import type { ReactNode } from 'react';
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

function formatEstimatedTime(runtime: RuntimeState | null, isRunning: boolean) {
    if (!isRunning) return 'Not running';

    const elapsed = runtime?.elapsed_seconds ?? 0;
    const percent = runtime?.module_progress_percent ?? runtime?.course_run_progress_percent ?? 0;

    if (elapsed <= 0 || percent <= 0) {
        return 'Calculating';
    }

    if (percent >= 100) {
        return 'Almost done';
    }

    const remainingSeconds = Math.round((elapsed * (100 - percent)) / percent);
    return formatElapsed(remainingSeconds);
}

function getElapsedProgress(runtime: RuntimeState | null) {
    if (runtime?.modules_total) {
        return Math.max(0, Math.min(runtime.module_progress_percent, 100));
    }

    const seconds = runtime?.elapsed_seconds ?? 0;
    return Math.max(0, Math.min((seconds / 1800) * 100, 100));
}

function MetricCard({
    title,
    value,
    label,
    visual,
}: {
    title: string;
    value: string | number;
    label: string;
    visual: ReactNode;
}) {
    return (
        <div
            style={{
                backgroundColor: 'color-mix(in srgb, var(--accent) 8%, var(--surface))',
                border: '1px solid color-mix(in srgb, var(--accent) 18%, var(--border))',
                borderRadius: '12px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 104px',
                gap: '18px',
                alignItems: 'center',
                minWidth: 0,
            }}
        >
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        letterSpacing: 0,
                        marginBottom: '14px',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        color: 'var(--text-primary)',
                        fontSize: '34px',
                        fontWeight: 800,
                        letterSpacing: 0,
                        lineHeight: '38px',
                    }}
                >
                    {value}
                </div>
                <div
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        lineHeight: '18px',
                        marginTop: '6px',
                    }}
                >
                    {label}
                </div>
            </div>

            {visual}
        </div>
    );
}

function CompletionRing({
    percent,
    label,
    size = 88,
    stroke = 10,
}: {
    percent: number;
    label: string;
    size?: number;
    stroke?: number;
}) {
    const radius = (size - stroke) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                position: 'relative',
                display: 'grid',
                placeItems: 'center',
                justifySelf: 'end',
            }}
            aria-label={label}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: 'stroke-dashoffset 180ms ease' }}
                />
            </svg>
            <span
                style={{
                    position: 'absolute',
                    color: 'var(--text-primary)',
                    fontSize: '17px',
                    fontWeight: 800,
                    letterSpacing: 0,
                }}
            >
                {percent}%
            </span>
        </div>
    );
}

function StudySegments({ percent, label }: { percent: number; label: string }) {
    return (
        <div
            aria-label={label}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '5px',
                width: '104px',
                height: '50px',
                alignItems: 'stretch',
            }}
        >
            {Array.from({ length: 10 }).map((_, index) => {
                const segmentPercent = ((index + 1) / 10) * 100;
                const isFilled = percent >= segmentPercent;

                return (
                    <span
                        key={index}
                        style={{
                            borderRadius: '999px',
                            backgroundColor: isFilled ? 'var(--accent)' : 'var(--surface-subtle)',
                            border: isFilled ? '1px solid var(--accent)' : '1px solid var(--border)',
                            transition: 'background-color 180ms ease, border-color 180ms ease',
                        }}
                    />
                );
            })}
        </div>
    );
}

function ElapsedVisual({ percent, label }: { percent: number; label: string }) {
    return (
        <div style={{ justifySelf: 'end' }}>
            <div
                aria-label={label}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '5px',
                    width: '96px',
                    height: '62px',
                    alignItems: 'end',
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
                                backgroundColor: 'var(--surface-subtle)',
                                border: '1px solid var(--border)',
                                height: '100%',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    height: `${fill * 100}%`,
                                    borderRadius: '999px',
                                    backgroundColor: 'var(--accent)',
                                    transition: 'height 180ms ease',
                                }}
                            />
                        </div>
                    );
                })}
            </div>
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
    const liveRuntime = isRunning ? runtime : null;

    const coursesComplete = courses
        ? courses.filter((course) => course.completion === 100).length
        : null;

    const courseTotal = courses?.length ?? 0;
    const courseProgressPercent = courseTotal > 0
        ? Math.round(((coursesComplete ?? 0) / courseTotal) * 100)
        : 0;

    const modulesValue = liveRuntime?.modules_total
        ? `${liveRuntime.modules_processed}/${liveRuntime.modules_total}`
        : isRunning
            ? String(modulesCompletedThisRun)
            : '0/0';

    const modulesSubtext = liveRuntime?.modules_total
        ? `${liveRuntime.module_progress_percent}% complete`
        : isRunning
            ? 'Topics studied this session'
            : 'No active study run';

    const elapsedProgress = getElapsedProgress(liveRuntime);
    const modulesProgress = liveRuntime?.modules_total ? liveRuntime.module_progress_percent : 0;
    const estimatedTime = formatEstimatedTime(liveRuntime, isRunning);
    const estimatedLabel = isRunning ? 'Estimated time remaining' : 'Starts after a study run begins';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))',
                gap: '16px',
                minWidth: 0,
            }}
        >
            <MetricCard
                title="Course Progress"
                value={courseTotal > 0 ? `${coursesComplete ?? 0}/${courseTotal}` : '0/0'}
                label="Courses completed"
                visual={<CompletionRing percent={courseProgressPercent} label={`Course progress ${courseProgressPercent}%`} />}
            />

            <MetricCard
                title={liveRuntime?.run_type === 'notes' ? 'Notes Progress' : 'Study Progress'}
                value={modulesValue}
                label={modulesSubtext}
                visual={<StudySegments percent={modulesProgress} label={modulesSubtext} />}
            />

            <MetricCard
                title="Estimated Time"
                value={estimatedTime}
                label={estimatedLabel}
                visual={<ElapsedVisual percent={elapsedProgress} label={estimatedLabel} />}
            />
        </div>
    );
}
