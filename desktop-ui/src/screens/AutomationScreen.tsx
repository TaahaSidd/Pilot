import { Check, Circle, Play, X } from 'lucide-react';
import { PilotMiniGame } from '../components/automation/PilotMiniGame';
import { LiveActivityLog } from '../components/automation/LiveActivityLog';
import { usePilotContext } from '../context/usePilotContext';
import type { LogEvent } from '../hooks/usePilot';
import type { RuntimeState } from '../api/api';
import { Card, PageHeader, ProgressBar as UiProgressBar, StatusBadge, type StatusBadgeTone } from '../components/ui';

type StepState = 'done' | 'active' | 'waiting' | 'failed';

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatStatus(value: string) {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatElapsed(seconds: number | null | undefined) {
    if (!seconds) return '0s';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins < 1) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

function getActionText(action: string | null, module: string | null) {
    if (!action) return 'No active execution';
    if (!module) return action;

    return action.replace(new RegExp(`:\\s*${escapeRegExp(module)}$`), '').trim();
}

function messageText(log: LogEvent) {
    return typeof log.message === 'string'
        ? log.message.toLowerCase()
        : JSON.stringify(log.message).toLowerCase();
}

function hasLog(logs: LogEvent[], patterns: string[]) {
    return logs.some((log) => {
        const text = messageText(log);
        return patterns.some((pattern) => text.includes(pattern));
    });
}

function getStatusMeta(status: string): { label: string; tone: StatusBadgeTone } {
    if (status === 'running') {
        return { label: 'Running', tone: 'running' };
    }

    if (status === 'done') {
        return { label: 'Done', tone: 'completed' };
    }

    if (status === 'stopped') {
        return { label: 'Stopped', tone: 'stopped' };
    }

    if (status === 'error') {
        return { label: 'Error', tone: 'failed' };
    }

    return { label: 'Idle', tone: 'ready' };
}

function getSteps(logs: LogEvent[], runtime: RuntimeState | null, isRunning: boolean) {
    const action = runtime?.current_action_label?.toLowerCase() ?? '';
    const currentCourse = runtime?.current_course ?? null;
    const hasError = runtime?.status === 'error' || hasLog(logs, ['error', 'failed']);
    const loggedIn = hasLog(logs, ['logged in', 'session active', 'checking session']) || Boolean(currentCourse);
    const openedCourse = Boolean(currentCourse) || hasLog(logs, ['opened course', 'processing:']);
    const readingPage = Boolean(runtime?.current_page) || action.includes('reading') || action.includes('generating');
    const generating = action.includes('generating') || hasLog(logs, ['content captured']);
    const saving = action.includes('saving') || hasLog(logs, ['note saved']);

    const rawSteps = [
        { label: 'Login', complete: loggedIn },
        { label: 'Open Course', complete: openedCourse },
        { label: 'Reading Page', complete: readingPage },
        { label: 'AI Generation', complete: generating },
        { label: 'Save Note', complete: saving },
    ];

    let activeIndex = rawSteps.findIndex((step) => !step.complete);

    if (!isRunning) {
        activeIndex = -1;
    }

    return rawSteps.map((step, index) => ({
        label: step.label,
        state: hasError && index === rawSteps.length - 1
            ? 'failed'
            : step.complete
                ? 'done'
                : index === activeIndex
                    ? 'active'
                    : 'waiting',
    })) as Array<{ label: string; state: StepState }>;
}

function getPageText(runtime: RuntimeState | null) {
    if (runtime?.module_current_index && runtime?.modules_total) {
        return `${runtime.module_current_index} / ${runtime.modules_total}`;
    }

    return runtime?.current_page ?? 'Waiting for page';
}

function StatusPill({ status }: { status: string }) {
    const meta = getStatusMeta(status);
    return <StatusBadge tone={meta.tone} label={meta.label} />;
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--type-caption-size)', marginBottom: 'var(--space-1)' }}>
                {label}
            </div>
            <div
                title={value}
                style={{
                    color: 'var(--text-primary)',
                    fontSize: 'var(--type-body-small-size)',
                    fontWeight: 600,
                    lineHeight: '18px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value}
            </div>
        </div>
    );
}

function TimelineIcon({ state }: { state: StepState }) {
    if (state === 'done') {
        return (
            <span style={iconStyle('var(--success-soft)', 'var(--success)')}>
                <Check size={13} />
            </span>
        );
    }

    if (state === 'active') {
        return (
            <span style={iconStyle('var(--accent-soft)', 'var(--accent)')}>
                <Play size={12} />
            </span>
        );
    }

    if (state === 'failed') {
        return (
            <span style={iconStyle('var(--error-soft)', 'var(--error)')}>
                <X size={13} />
            </span>
        );
    }

    return <Circle size={16} color="var(--text-muted)" />;
}

function iconStyle(backgroundColor: string, color: string) {
    return {
        width: '20px',
        height: '20px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
    } as const;
}

function CompactTimeline({ steps }: { steps: Array<{ label: string; state: StepState }> }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 'var(--space-3)' }}>
            {steps.map((step) => (
                <div
                    key={step.label}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        minWidth: 0,
                        color: step.state === 'waiting' ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontSize: 'var(--type-caption-size)',
                        fontWeight: step.state === 'active' ? 700 : 600,
                    }}
                >
                    <TimelineIcon state={step.state} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {step.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function RuntimeSummary({ runtime }: { runtime: RuntimeState | null }) {
    return (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 className="pilot-type-section-title" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Runtime Summary
            </h3>
            <Field label="Run Type" value={runtime?.run_type ?? 'None'} />
            <Field label="Elapsed Time" value={formatElapsed(runtime?.elapsed_seconds)} />
            <Field label="Browser" value={runtime?.browser_open ? 'Open' : 'Closed'} />
            <Field label="Login" value={runtime?.awaiting_login ? 'Required' : 'Clear'} />
        </Card>
    );
}

export function AutomationScreen() {
    const { logs, status, runtime } = usePilotContext();
    const currentStatus = runtime?.status ?? status;
    const isRunning = currentStatus === 'running';
    const hasExecution = isRunning || Boolean(runtime?.current_action_label || runtime?.current_course || runtime?.current_module);
    const actionText = getActionText(runtime?.current_action_label ?? null, runtime?.current_module ?? null);
    const supportText = runtime?.awaiting_login
        ? 'Waiting for login verification'
        : hasExecution
            ? runtime?.current_page
                ? `Reading ${getPageText(runtime)}`
                : runtime?.current_module ?? runtime?.current_course ?? 'Pilot is preparing the next action'
            : 'Start a workflow to see live progress here.';
    const moduleProgress = runtime?.module_progress_percent ?? 0;
    const progressText = runtime?.modules_total
        ? `${runtime.modules_processed} / ${runtime.modules_total} modules, ${runtime.module_progress_percent}%`
        : 'Waiting for module data';
    const steps = getSteps(logs, runtime, isRunning);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <PageHeader
                title="Automation Monitor"
                description="Developer view for the current Pilot runtime."
                actions={isRunning ? <StatusBadge tone="running" label="Live" /> : undefined}
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 360px',
                    gap: 'var(--space-5)',
                    alignItems: 'start',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
                    <Card padding="lg" style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0, flex: 1 }}>
                                <StatusPill status={currentStatus} />

                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--type-caption-size)', marginBottom: 'var(--space-2)' }}>
                                        Current Action
                                    </div>
                                    <div
                                        title={actionText}
                                        style={{
                                            color: hasExecution ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            fontSize: '28px',
                                            fontWeight: 700,
                                            letterSpacing: 0,
                                            lineHeight: '34px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {actionText}
                                    </div>
                                    <div
                                        title={supportText}
                                        style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--type-body-small-size)',
                                            lineHeight: '20px',
                                            marginTop: '6px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {supportText}
                                    </div>
                                </div>
                            </div>

                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', flexShrink: 0 }}>
                                {formatElapsed(runtime?.elapsed_seconds)}
                            </div>
                        </div>

                        {hasExecution && (
                            <>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                gap: 'var(--space-4)',
                                marginTop: 'var(--space-6)',
                                paddingTop: 'var(--space-5)',
                                borderTop: 'var(--stroke-thin) solid var(--border-subtle)',
                                    }}
                                >
                                    <Field label="Course" value={runtime?.current_course ?? 'Preparing course'} />
                                    <Field label="Module" value={runtime?.current_module ?? 'Preparing module'} />
                                    <Field label="Page" value={getPageText(runtime)} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 'var(--type-body-small-size)' }}>
                                        <span>Module Progress</span>
                                        <span>{progressText}</span>
                                    </div>
                                    <UiProgressBar value={moduleProgress} height="12px" />
                                </div>
                            </>
                        )}

                        {!hasExecution && (
                            <div
                                style={{
                                    marginTop: 'var(--space-6)',
                                    padding: 'var(--space-4)',
                                    borderRadius: 'var(--radius-card)',
                                    border: 'var(--stroke-thin) solid var(--border-subtle)',
                                    backgroundColor: 'var(--surface-subtle)',
                                    color: 'var(--text-secondary)',
                                    fontSize: 'var(--type-body-small-size)',
                                    lineHeight: '20px',
                                }}
                            >
                                No active execution. Start a workflow to see live progress here.
                            </div>
                        )}
                    </Card>

                    <Card>
                        <div className="pilot-type-section-title" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                            Execution Timeline
                        </div>
                        <CompactTimeline steps={steps} />
                    </Card>

                    <details
                        style={{
                            border: 'var(--stroke-thin) solid var(--border-subtle)',
                            borderRadius: 'var(--radius-card)',
                            backgroundColor: 'var(--surface-card)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <summary
                            style={{
                                padding: 'var(--space-4) var(--space-5)',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: 'var(--type-body-size)',
                                fontWeight: 600,
                                letterSpacing: 0,
                            }}
                        >
                            Advanced Logs
                        </summary>

                        <details
                            style={{
                                borderTop: 'var(--stroke-thin) solid var(--border-subtle)',
                                backgroundColor: 'var(--surface-card)',
                            }}
                        >
                            <summary
                                style={{
                                    padding: 'var(--space-3) var(--space-5)',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: 'var(--type-body-small-size)',
                                    fontWeight: 600,
                                }}
                            >
                                Developer Diagnostics
                            </summary>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                    gap: 'var(--space-3)',
                                    padding: '0 var(--space-5) var(--space-4)',
                                }}
                            >
                                <Field label="Status" value={formatStatus(currentStatus)} />
                                <Field label="Run Type" value={runtime?.run_type ?? 'None'} />
                                <Field label="Stop Request" value={runtime?.stop_requested ? 'Requested' : 'None'} />
                                <Field label="Error" value={runtime?.error ?? 'None'} />
                            </div>
                        </details>

                        <LiveActivityLog logs={logs} title="Automation stream" />
                    </details>
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
                    <PilotMiniGame />
                    <RuntimeSummary runtime={runtime} />
                </aside>
            </div>
        </div>
    );
}
