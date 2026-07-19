import { ExternalLink } from 'lucide-react';
import { Button } from '../shared/Button';
import type { LogEvent, PilotStatus, RuntimeState } from '../../hooks/usePilot';
import type { ReactNode } from 'react';
import { Card, ProgressBar as PilotProgressBar, StatusBadge, type StatusBadgeTone } from '../ui';
import {
    countNotesSaved,
    currentAction,
    formatDuration,
    formatFinishedAt,
    getStudyRunMode,
    pageText,
    progressText,
    progressValue,
    type StudyRunMode,
} from './studyRunHelpers';

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
    const mode = getStudyRunMode(props.status, props.runtime, props.awaitingLogin);
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
