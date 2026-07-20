import type { PilotStatus, CourseSummary, RuntimeState } from '../../hooks/usePilot';
import { CompletionRing, ElapsedVisual, MetricCard, StudySegments } from './MetricVisuals';

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

export function StatsGrid({
    status,
    runtime,
    courses,
    modulesCompletedThisRun,
}: StatsGridProps) {
    const isRunning = status === 'running';
    const liveRuntime = isRunning ? runtime : null;

    const runtimeCourseTotal = liveRuntime?.courses_total ?? 0;
    const runtimeCoursesComplete = liveRuntime?.courses_completed ?? 0;
    const savedCoursesComplete = courses
        ? courses.filter((course) => course.completion === 100).length
        : null;

    const courseTotal = runtimeCourseTotal || courses?.length || 0;
    const coursesComplete = runtimeCourseTotal ? runtimeCoursesComplete : savedCoursesComplete;
    const courseProgressPercent = courseTotal > 0
        ? Math.round(((coursesComplete ?? 0) / courseTotal) * 100)
        : 0;

    const modulesValue = liveRuntime?.modules_total
        ? `${liveRuntime.modules_processed}/${liveRuntime.modules_total}`
        : isRunning
            ? String(modulesCompletedThisRun)
            : 'No run';

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
            className="pilot-stats-grid"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
                gap: 'var(--space-5)',
                minWidth: 0,
            }}
        >
            <MetricCard
                title="Courses"
                value={courseTotal > 0 ? `${coursesComplete ?? 0}/${courseTotal}` : '0/0'}
                label={`${courseProgressPercent}% complete`}
                visual={<CompletionRing percent={courseProgressPercent} label={`Course progress ${courseProgressPercent}%`} />}
            />

            <MetricCard
                title={liveRuntime?.run_type === 'notes' ? 'Notes' : 'Topics'}
                value={modulesValue}
                label={modulesSubtext}
                visual={<StudySegments percent={modulesProgress} label={modulesSubtext} />}
            />

            <MetricCard
                title="Time"
                value={estimatedTime}
                label={estimatedLabel}
                visual={<ElapsedVisual percent={elapsedProgress} label={estimatedLabel} />}
            />
        </div>
    );
}
