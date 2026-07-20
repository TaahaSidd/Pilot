import type { LogEvent, PilotStatus, RuntimeState } from '../../hooks/usePilot';

export type StudyRunMode = 'idle' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed';

export function getStudyRunMode(status: PilotStatus, runtime: RuntimeState | null, awaitingLogin: boolean): StudyRunMode {
    if ((awaitingLogin || runtime?.awaiting_login) && status === 'running') return 'paused';
    if (status === 'running') return 'running';
    if (status === 'done') return 'completed';
    if (status === 'stopped') return 'stopped';
    if (status === 'error') return 'failed';
    return 'idle';
}

export function formatDuration(seconds?: number | null) {
    if (!seconds) return 'Not tracked';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;
    if (minutes < 60) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const leftoverMinutes = minutes % 60;
    return leftoverMinutes ? `${hours}h ${leftoverMinutes}m` : `${hours}h`;
}

export function formatFinishedAt(value?: string | null) {
    if (!value) return 'Just now';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const isToday = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return isToday ? `Today, ${time}` : `${date.toLocaleDateString()}, ${time}`;
}

export function countNotesSaved(logs: LogEvent[]) {
    return logs.filter((log) => {
        const text = typeof log.message === 'string' ? log.message.toLowerCase() : JSON.stringify(log.message).toLowerCase();
        return text.includes('note saved');
    }).length;
}

export function currentAction(runtime: RuntimeState | null) {
    if (!runtime) return 'Working on your study run';

    const actionLabels: Record<string, string> = {
        launching_browser: 'Opening browser',
        checking_session: 'Checking login',
        waiting_login: 'Waiting for login',
        login_confirmed: 'Login confirmed',
        scanning_courses: 'Scanning courses',
        opening_course: 'Opening course',
        scanning_modules: 'Scanning topics',
        processing_module: 'Processing topic',
        reading_page: 'Reading page',
        processing_quiz: 'Processing quiz',
        processing_feedback: 'Processing feedback',
        generating_notes: 'Generating notes',
        saving_notes: 'Saving notes',
        closing_browser: 'Ending session',
        stopping: 'Stopping',
    };

    if (runtime.current_action && actionLabels[runtime.current_action]) {
        return actionLabels[runtime.current_action];
    }

    const label = runtime.current_action_label || runtime.current_action;
    if (!label) return 'Working on your study run';

    const [stableLabel] = label.split(':');
    return stableLabel || label;
}

export function currentItemText(runtime: RuntimeState | null) {
    if (!runtime) return 'Pilot is preparing the next study step.';

    const labelDetail = runtime.current_action_label?.split(':').slice(1).join(':').trim();
    if (labelDetail) return labelDetail;

    if (runtime.current_page && runtime.current_module && runtime.current_page !== runtime.current_module) {
        return runtime.current_page;
    }

    return runtime.current_module || runtime.current_page || 'Pilot is preparing the next study step.';
}

export function pageText(runtime: RuntimeState | null) {
    if (!runtime) return 'Waiting for page data';
    if (runtime.module_current_index && runtime.modules_total) {
        return `${runtime.module_current_index} of ${runtime.modules_total}`;
    }
    return runtime.current_page || 'Waiting for page data';
}

export function progressText(runtime: RuntimeState | null) {
    if (!runtime?.modules_total) return 'Waiting for progress';
    return `${runtime.modules_processed} of ${runtime.modules_total} topics`;
}

export function progressValue(runtime: RuntimeState | null) {
    if (!runtime?.modules_total) return 0;
    return Math.max(0, Math.min(100, runtime.module_progress_percent || runtime.course_run_progress_percent || 0));
}
