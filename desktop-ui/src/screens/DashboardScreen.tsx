import { useState } from 'react';
import { FileText, Play, Square } from 'lucide-react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { InterventionBanner } from '../components/dashboard/InterventionBanner';
import { CourseGrid } from '../components/dashboard/CourseGrid';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Button } from '../components/shared/Button';
import { usePilotContext } from '../context/usePilotContext';
import type { CourseSummary } from '../api/api';

type ActionRequiredNotice = {
    id: string;
    title: string;
    message: string;
    severity: 'warning' | 'error';
    dismissible?: boolean;
};

function getActionRequiredNotice({
    awaitingLogin,
    status,
    logs,
    runtimeError,
}: {
    awaitingLogin: boolean;
    status: string;
    logs: Array<{ message: unknown }>;
    runtimeError?: string | null;
}): ActionRequiredNotice | null {
    const recentText = logs
        .slice(-12)
        .map((entry) => typeof entry.message === 'string' ? entry.message.toLowerCase() : JSON.stringify(entry.message).toLowerCase())
        .join(' ');

    if (awaitingLogin) {
        return {
            id: 'login-verification',
            title: 'Login verification required',
            message: 'Complete the CAPTCHA in the browser, then continue.',
            severity: 'warning',
        };
    }

    if (recentText.includes('groq api limit reached')) {
        return {
            id: 'groq-quota',
            title: 'Groq quota reached',
            message: 'Notes generation stopped because your Groq quota was exhausted.',
            severity: 'error',
            dismissible: true,
        };
    }

    if (status === 'error') {
        return {
            id: 'runtime-error',
            title: 'Pilot needs attention',
            message: runtimeError ?? 'Pilot ran into a problem and cannot continue this run.',
            severity: 'error',
            dismissible: true,
        };
    }

    return null;
}

export function DashboardScreen({
    onOpenCourseNotes,
    onOpenSettings,
}: {
    onOpenCourseNotes?: (course: CourseSummary) => void;
    onOpenSettings?: () => void;
}) {
    const {
        status,
        configured,
        config,
        runtime,
        courses,
        modulesCompletedThisRun,
        logs,
        awaitingLogin,
        startWorkflow,
        startNotes,
        stopRuntime,
        confirmLogin,
        toggleBrowser,
    } = usePilotContext();

    const isRunning = status === 'running';
    const userName = config?.display_name || config?.username || 'there';
    const [pendingAction, setPendingAction] = useState<'workflow' | 'stop' | 'notes' | null>(null);
    const [dismissedNoticeId, setDismissedNoticeId] = useState<string | null>(null);
    const actionRequiredNotice = getActionRequiredNotice({
        awaitingLogin,
        status,
        logs,
        runtimeError: runtime?.error,
    });
    const shouldShowActionNotice = actionRequiredNotice && dismissedNoticeId !== actionRequiredNotice.id;

    async function runDashboardAction(action: 'workflow' | 'stop' | 'notes') {
        try {
            setPendingAction(action);

            if (action === 'workflow') {
                await startWorkflow();
                return;
            }

            if (action === 'notes') {
                await startNotes();
                return;
            }

            await stopRuntime(true);
        } catch (error) {
            console.error('Dashboard action failed', error);
        } finally {
            setPendingAction(null);
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                paddingBottom: '32px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '20px',
                }}
            >
                <h1
                    style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        letterSpacing: 0,
                        color: 'var(--text-primary)',
                        margin: 0,
                    }}
                >
                    Welcome, {userName}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        variant={isRunning ? 'danger' : 'primary'}
                        icon={isRunning ? Square : Play}
                        onClick={() => runDashboardAction(isRunning ? 'stop' : 'workflow')}
                        disabled={!configured || pendingAction !== null}
                        loading={pendingAction === 'workflow' || pendingAction === 'stop'}
                        loadingText={pendingAction === 'stop' ? 'Stopping' : 'Starting'}
                    >
                        {isRunning ? 'Stop' : 'Start Study Run'}
                    </Button>

                    <Button
                        variant="secondary"
                        icon={FileText}
                        onClick={() => runDashboardAction('notes')}
                        disabled={!configured || isRunning || pendingAction !== null}
                        loading={pendingAction === 'notes'}
                    >
                        Generate Notes
                    </Button>
                </div>
            </div>

            {shouldShowActionNotice && (
                <InterventionBanner
                    title={actionRequiredNotice.title}
                    message={actionRequiredNotice.message}
                    severity={actionRequiredNotice.severity}
                    dismissible={actionRequiredNotice.dismissible}
                    onDismiss={() => setDismissedNoticeId(actionRequiredNotice.id)}
                    primaryAction={
                        actionRequiredNotice.id === 'login-verification'
                            ? { label: "I've Finished", onClick: confirmLogin }
                            : actionRequiredNotice.id === 'groq-quota'
                                ? { label: 'Open Settings', onClick: onOpenSettings ?? (() => undefined) }
                                : undefined
                    }
                    secondaryAction={
                        actionRequiredNotice.id === 'login-verification'
                            ? { label: 'Open Browser', onClick: toggleBrowser }
                            : actionRequiredNotice.id === 'groq-quota'
                                ? { label: 'Dismiss', onClick: () => setDismissedNoticeId(actionRequiredNotice.id) }
                                : undefined
                    }
                />
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 400px)',
                    gap: '20px',
                    alignItems: 'start',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        minWidth: 0,
                    }}
                >
                    <StatsGrid
                        status={status}
                        runtime={runtime}
                        courses={courses}
                        modulesCompletedThisRun={modulesCompletedThisRun}
                    />

                    <CourseGrid courses={courses} onSelectCourse={onOpenCourseNotes} />
                </div>

                <div
                    style={{
                        minWidth: 0,
                        position: 'sticky',
                        top: 0,
                    }}
                >
                    <ActivityFeed
                        logs={logs}
                        runtime={runtime}
                        status={status}
                        awaitingLogin={awaitingLogin}
                        onStartStudyRun={() => runDashboardAction('workflow')}
                        onOpenBrowser={toggleBrowser}
                        onConfirmLogin={confirmLogin}
                        actionDisabled={!configured || pendingAction !== null}
                        starting={pendingAction === 'workflow'}
                    />
                </div>
            </div>
        </div>
    );
}
