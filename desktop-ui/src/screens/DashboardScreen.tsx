import { useState } from 'react';
import { FileText, Play, Square } from 'lucide-react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { InterventionBanner } from '../components/dashboard/InterventionBanner';
import { CourseGrid } from '../components/dashboard/CourseGrid';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { PilotMiniGame } from '../components/automation/PilotMiniGame';
import { Button, PageHeader } from '../components/ui';
import { DashboardSkeleton } from '../components/shared/SkeletonScreens';
import { GuidedTour, type GuidedTourStep } from '../components/shared/GuidedTour';
import { usePilotContext } from '../context/usePilotContext';
import type { CourseSummary } from '../api/api';

type ActionRequiredNotice = {
    id: string;
    title: string;
    message: string;
    severity: 'warning' | 'error';
    dismissible?: boolean;
};

const dashboardTourSteps: GuidedTourStep[] = [
    {
        target: 'start-study-run',
        title: 'Start here',
        description: 'Use Start Study Run when you want Pilot to open your study material and track progress for you.',
    },
    {
        target: 'generate-notes',
        title: 'Generate notes',
        description: 'Use this when you only want Pilot to create notes from your available study material.',
    },
    {
        target: 'dashboard-stats',
        title: 'Your study progress',
        description: 'These cards show course completion, topics covered in the current run, and estimated time.',
    },
    {
        target: 'study-run-card',
        title: 'Current study run',
        description: 'This panel tells you what Pilot is doing right now, or what happened in the latest session.',
    },
    {
        target: 'courses-grid',
        title: 'Open your courses',
        description: 'Click a course card to jump into its generated notes when notes are available.',
    },
    {
        target: 'updates-button',
        title: 'Check updates',
        description: 'Important events like completed notes, login checks, and errors are saved here.',
    },
];

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
        statusLoading,
        configured,
        config,
        runtime,
        courses,
        coursesLoading,
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
    const isDashboardLoading = statusLoading || coursesLoading;
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
                gap: 'var(--space-6, 24px)',
                paddingBottom: 'var(--space-8, 32px)',
            }}
        >
            <PageHeader
                title={`Welcome, ${userName}`}
                actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Button
                        data-tour-id="start-study-run"
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
                        data-tour-id="generate-notes"
                        variant="secondary"
                        icon={FileText}
                        onClick={() => runDashboardAction('notes')}
                        disabled={!configured || isRunning || pendingAction !== null}
                        loading={pendingAction === 'notes'}
                    >
                        Generate Notes
                    </Button>
                    </div>
                }
            />

            {isDashboardLoading ? (
                <DashboardSkeleton />
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 400px)',
                        gap: 'var(--space-5, 20px)',
                        alignItems: 'start',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-6, 24px)',
                            minWidth: 0,
                        }}
                    >
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

                        <div data-tour-id="dashboard-stats">
                            <StatsGrid
                                status={status}
                                runtime={runtime}
                                courses={courses}
                                modulesCompletedThisRun={modulesCompletedThisRun}
                            />
                        </div>

                        <div data-tour-id="courses-grid">
                            <CourseGrid courses={courses} onSelectCourse={onOpenCourseNotes} />
                        </div>
                    </div>

                    <div
                        style={{
                            minWidth: 0,
                            position: 'sticky',
                            top: 0,
                            display: 'grid',
                            gap: 'var(--space-5, 20px)',
                        }}
                    >
                        <div data-tour-id="study-run-card">
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

                        <div style={{ height: '96px' }}>
                            <PilotMiniGame variant="compact" />
                        </div>
                    </div>
                </div>
            )}

            {!isDashboardLoading && (
                <GuidedTour
                    storageKey="pilot-dashboard-tour-v1"
                    steps={dashboardTourSteps}
                    devAlwaysShow
                />
            )}
        </div>
    );
}
