import { ExternalLink } from 'lucide-react';
import { Button } from '../shared/Button';
import type { LogEvent, PilotStatus, RuntimeState } from '../../hooks/usePilot';
import type { ReactNode } from 'react';
import { Card, ProgressBar as PilotProgressBar, StatusBadge, type StatusBadgeTone } from '../ui';

interface StudyRunCardProps {
    logs: LogEvent[];
    runtime: RuntimeState | null;
    status: PilotStatus;
    awaitingLogin: boolean;
    onStartStudyRun?: () => void;
    onOpenBrowser?: () => void;
    onConfirmLogin?: () => void;
    actionDisabled?: boolean;
    starting?: boolean;
}

type StudyRunMode = 'idle' | 'running' | 'paused' | 'completed' | 'stopped' | 'failed';

function getMode(status: PilotStatus, runtime: RuntimeState | null, awaitingLogin: boolean): StudyRunMode {
    if ((awaitingLogin || runtime?.awaiting_login) && status === 'running') return 'paused';
    if (status === 'running') return 'running';
    if (status === 'done') return 'completed';
    if (status === 'stopped') return 'stopped';
    if (status === 'error') return 'failed';
    return 'idle';
}

function formatDuration(seconds?: number | null) {
    if (!seconds) return 'Not tracked';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;
    if (minutes < 60) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const leftoverMinutes = minutes % 60;
    return leftoverMinutes ? `${hours}h ${leftoverMinutes}m` : `${hours}h`;
}

function formatFinishedAt(value?: string | null) {
    if (!value) return 'Just now';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Just now';

    const isToday = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return isToday ? `Today, ${time}` : `${date.toLocaleDateString()}, ${time}`;
}

function countNotesSaved(logs: LogEvent[]) {
    return logs.filter((log) => {
        const text = typeof log.message === 'string' ? log.message.toLowerCase() : JSON.stringify(log.message).toLowerCase();
        return text.includes('note saved');
    }).length;
}

function currentAction(runtime: RuntimeState | null) {
    return runtime?.current_action_label || runtime?.current_action || 'Working on your study run';
}

function pageText(runtime: RuntimeState | null) {
    if (!runtime) return 'Waiting for page data';
    if (runtime.module_current_index && runtime.modules_total) {
        return `${runtime.module_current_index} of ${runtime.modules_total}`;
    }
    return runtime.current_page || 'Waiting for page data';
}

function progressText(runtime: RuntimeState | null) {
    if (!runtime?.modules_total) return 'Waiting for progress';
    return `${runtime.modules_processed} of ${runtime.modules_total} topics`;
}

function progressValue(runtime: RuntimeState | null) {
    if (!runtime?.modules_total) return 0;
    return Math.max(0, Math.min(100, runtime.module_progress_percent || runtime.course_run_progress_percent || 0));
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div
            style={{
                display: 'grid',
                gap: '5px',
                padding: '12px 0',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '16px' }}>
                {label}
            </div>
            <div
                style={{
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: '19px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
                title={String(value ?? 'Not available')}
            >
                {value ?? 'Not available'}
            </div>
        </div>
    );
}

function statusToneForMode(mode: StudyRunMode): StatusBadgeTone {
    if (mode === 'idle') return 'ready';
    if (mode === 'running') return 'running';
    if (mode === 'paused') return 'attention';
    if (mode === 'completed') return 'completed';
    if (mode === 'stopped') return 'stopped';
    return 'failed';
}

function CardShell({ children }: { children: ReactNode }) {
    return (
        <Card padding="lg" style={{ minHeight: '340px' }}>
            {children}
        </Card>
    );
}

function EmptyState() {
    return (
        <CardShell>
            <div
                style={{
                    minHeight: '248px',
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                }}
            >
                <div style={{ display: 'grid', justifyItems: 'center', gap: '8px' }}>
                    <div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, marginBottom: '7px' }}>
                            Ready to Study
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '20px' }}>
                            Press Start Study Run to begin.
                            <br />
                            Pilot will read your topics and prepare notes automatically.
                        </div>
                    </div>
                </div>
            </div>
        </CardShell>
    );
}

function LiveState({ runtime, mode, onOpenBrowser, onConfirmLogin }: StudyRunCardProps & { mode: 'running' | 'paused' }) {
    const value = progressValue(runtime);

    return (
        <CardShell>
            <div style={{ display: 'grid', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                        <StatusBadge tone={statusToneForMode(mode)} label={mode === 'paused' ? 'Needs attention' : undefined} />
                        <h4 style={{ margin: '14px 0 6px', color: 'var(--text-primary)', fontSize: '22px', fontWeight: 720, lineHeight: '28px' }}>
                            {mode === 'paused' ? 'Study Run Paused' : currentAction(runtime)}
                        </h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '20px' }}>
                            {mode === 'paused'
                                ? 'Waiting for login verification.'
                                : runtime?.current_module || runtime?.current_page || 'Pilot is preparing the next study step.'}
                        </p>
                    </div>
                </div>

                <div>
                    <Field label="Current Course" value={runtime?.current_course} />
                    <Field label="Current Module" value={runtime?.current_module} />
                    <Field label="Page" value={pageText(runtime)} />
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Progress</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 700 }}>
                            {progressText(runtime)}
                        </span>
                    </div>
                    <PilotProgressBar value={value} label={`${value}% complete`} />
                </div>

                {mode === 'paused' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '2px' }}>
                        {onOpenBrowser && (
                            <Button size="sm" variant="secondary" icon={ExternalLink} onClick={onOpenBrowser}>
                                Open Browser
                            </Button>
                        )}
                        {onConfirmLogin && (
                            <Button size="sm" onClick={onConfirmLogin}>
                                I've Finished
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </CardShell>
    );
}

function SummaryState({ runtime, logs, mode }: StudyRunCardProps & { mode: 'completed' | 'stopped' | 'failed' }) {
    const notesSaved = mode === 'completed' ? countNotesSaved(logs) : 0;
    const isFailure = mode === 'failed';
    const title = isFailure ? 'Study Run Failed' : mode === 'stopped' ? 'Study Run Stopped' : 'Study Run Complete';
    const message = isFailure
        ? 'Pilot could not finish the study run.'
        : mode === 'stopped'
            ? 'The study run has ended. Start a new run when you are ready.'
            : 'Your study run finished successfully.';

    return (
        <CardShell>
            <div style={{ display: 'grid', gap: '18px' }}>
                <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '22px', fontWeight: 720, lineHeight: '28px' }}>
                        {title}
                    </h4>
                    <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '19px' }}>
                        {message}
                    </p>
                    <div style={{ marginTop: '8px' }}>
                        <StatusBadge tone={statusToneForMode(mode)} />
                    </div>
                </div>

                {isFailure && runtime?.error && (
                    <div
                        style={{
                            borderRadius: '10px',
                            border: '1px solid color-mix(in srgb, var(--error) 26%, var(--border))',
                            backgroundColor: 'var(--error-soft)',
                            color: 'var(--text-primary)',
                            padding: '12px',
                            fontSize: '13px',
                            lineHeight: '19px',
                        }}
                    >
                        {runtime.error}
                    </div>
                )}

                <div>
                    <Field label="Duration" value={formatDuration(runtime?.elapsed_seconds)} />
                    <Field label="Result" value={mode === 'completed' ? 'Completed successfully' : mode === 'stopped' ? 'Stopped by user' : 'Needs attention'} />
                    {mode === 'completed' && (
                        <Field label="Notes generated" value={notesSaved || 'Not tracked'} />
                    )}
                    <Field label="Finished" value={formatFinishedAt(runtime?.finished_at)} />
                </div>
            </div>
        </CardShell>
    );
}

export function ActivityFeed(props: StudyRunCardProps) {
    const mode = getMode(props.status, props.runtime, props.awaitingLogin);
    const heading = mode === 'running' || mode === 'paused' ? 'Current Study Run' : 'Study Run';

    return (
        <div style={{ minWidth: 0 }}>
            <h3
                style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                    marginTop: 0,
                    letterSpacing: 0,
                }}
            >
                {heading}
            </h3>

            {mode === 'idle' && <EmptyState />}
            {mode === 'running' && <LiveState {...props} mode="running" />}
            {mode === 'paused' && <LiveState {...props} mode="paused" />}
            {mode === 'completed' && <SummaryState {...props} mode="completed" />}
            {mode === 'stopped' && <SummaryState {...props} mode="stopped" />}
            {mode === 'failed' && <SummaryState {...props} mode="failed" />}
        </div>
    );
}
