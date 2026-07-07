// src/screens/DashboardScreen.tsx
import React from 'react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { InterventionBanner } from '../components/dashboard/InterventionBanner';
import { CourseGrid } from '../components/dashboard/CourseGrid';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Button } from '../components/shared/Button';
import { Play, FileText, GlobeOff, Square } from 'lucide-react';
import { usePilotContext } from '../context/usePilotContext';

export function DashboardScreen() {
    const {
        status,
        statusError,
        configured,
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

    const subtitle = !configured
        ? 'Finish setup to start automating your portal.'
        : isRunning
            ? runtime?.current_action_label ?? 'An automation run is in progress.'
            : status === 'error'
                ? `Last run failed${statusError ? `: ${statusError}` : '.'}`
                : status === 'stopped'
                    ? 'Last run was stopped.'
                    : 'Ready to run.';

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
                            letterSpacing: '-0.02em',
                            marginBottom: '4px',
                            color: 'var(--text-primary)',
                            margin: '0 0 4px 0',
                        }}
                    >
                        Pilot
                    </h1>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        {subtitle}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Button
                        variant={isRunning ? 'danger' : 'primary'}
                        icon={isRunning ? Square : Play}
                        onClick={isRunning ? () => stopRuntime(false) : startWorkflow}
                        disabled={!configured}
                    >
                        {isRunning ? 'Stop' : 'Start Automation'}
                    </Button>

                    <Button
                        variant="secondary"
                        icon={FileText}
                        onClick={startNotes}
                        disabled={!configured || isRunning}
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

            <StatsGrid
                status={status}
                statusError={statusError}
                configured={configured}
                runtime={runtime}
                courses={courses}
                modulesCompletedThisRun={modulesCompletedThisRun}
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px',
                    alignItems: 'start',
                }}
            >
                <CourseGrid courses={courses} />
                <ActivityFeed logs={logs} />
            </div>
        </div>
    );
}