import { useState } from 'react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { InterventionBanner } from '../components/dashboard/InterventionBanner';
import { CourseGrid } from '../components/dashboard/CourseGrid';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Button } from '../components/shared/Button';
import { Play, FileText, GlobeOff, Square } from 'lucide-react';
import { usePilotContext } from '../context/usePilotContext';
import type { CourseSummary } from '../api/api';

export function DashboardScreen({ onOpenCourseNotes }: { onOpenCourseNotes?: (course: CourseSummary) => void }) {
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
                <div>
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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        variant={isRunning ? 'danger' : 'primary'}
                        icon={isRunning ? Square : Play}
                        onClick={() => runDashboardAction(isRunning ? 'stop' : 'workflow')}
                        disabled={!configured || pendingAction !== null}
                        loading={pendingAction === 'workflow' || pendingAction === 'stop'}
                        loadingText={pendingAction === 'stop' ? 'Stopping' : 'Starting'}
                    >
                        {isRunning ? 'Stop' : 'Start Automation'}
                    </Button>

                    <Button
                        variant="secondary"
                        icon={FileText}
                        onClick={() => runDashboardAction('notes')}
                        disabled={!configured || isRunning || pendingAction !== null}
                        loading={pendingAction === 'notes'}
                        style={{ padding: '9px 10px' }}
                        title="Notes Agent"
                    >
                        {''}
                    </Button>

                    <Button
                        variant="outline"
                        icon={GlobeOff}
                        onClick={toggleBrowser}
                        style={{ padding: '9px 10px' }}
                        title="Bring browser window to front"
                    >
                        {''}
                    </Button>
                </div>
            </div>

            {awaitingLogin && (
                <InterventionBanner awaitingLogin={awaitingLogin} confirmLogin={confirmLogin} />
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
                    <ActivityFeed logs={logs} />
                </div>
            </div>
        </div>
    );
}
