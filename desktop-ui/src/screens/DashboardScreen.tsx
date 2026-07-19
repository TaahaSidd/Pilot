import { StatsGrid } from '../components/dashboard/StatsGrid';
import { InterventionBanner } from '../components/dashboard/InterventionBanner';
import { CourseGrid } from '../components/dashboard/CourseGrid';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { PilotMiniGame } from '../components/automation/PilotMiniGame';
import { DashboardActions } from '../components/dashboard/DashboardActions';
import { PageHeader } from '../components/ui';
import { DashboardSkeleton } from '../components/shared/SkeletonScreens';
import { GuidedTour, type GuidedTourStep } from '../components/shared/GuidedTour';
import { useDashboardScreen } from '../hooks/useDashboardScreen';
import type { CourseSummary } from '../api/api';

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
        runtime,
        courses,
        modulesCompletedThisRun,
        logs,
        awaitingLogin,
        confirmLogin,
        toggleBrowser,
        actionRequiredNotice,
        dismissNotice,
        isDashboardLoading,
        isRunning,
        pendingAction,
        runDashboardAction,
        shouldShowActionNotice,
        userName,
    } = useDashboardScreen();

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
                    <DashboardActions
                        configured={configured}
                        isRunning={isRunning}
                        pendingAction={pendingAction}
                        onRunAction={runDashboardAction}
                    />
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
                        {shouldShowActionNotice && actionRequiredNotice && (
                            <InterventionBanner
                                title={actionRequiredNotice.title}
                                message={actionRequiredNotice.message}
                                severity={actionRequiredNotice.severity}
                                dismissible={actionRequiredNotice.dismissible}
                                onDismiss={() => dismissNotice(actionRequiredNotice.id)}
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
                                            ? { label: 'Dismiss', onClick: () => dismissNotice(actionRequiredNotice.id) }
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
                />
            )}
        </div>
    );
}
