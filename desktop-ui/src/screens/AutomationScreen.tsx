// src/screens/AutomationScreen.tsx
import React from 'react';
import { PilotMiniGame } from '../components/automation/PilotMiniGame';
import { LiveActivityLog } from '../components/automation/LiveActivityLog';
import { usePilotContext } from '../context/usePilotContext';

const STATUS_LABEL: Record<string, string> = {
    idle: 'Idle',
    running: 'Running',
    done: 'Completed',
    stopped: 'Stopped',
    error: 'Failed',
};

const STATUS_COLOR: Record<string, string> = {
    idle: 'var(--text-muted)',
    running: '#a855f7',
    done: 'var(--success)',
    stopped: 'var(--warning)',
    error: 'var(--error)',
};

export function AutomationScreen() {
    const { logs, status, runtime } = usePilotContext();

    const isRunning = status === 'running';

    const currentCourseText = runtime?.current_course ?? null;
    const currentModuleText = runtime?.current_module ?? null;
    const currentActionText = runtime?.current_action_label ?? null;
    const progress = runtime?.module_progress_percent ?? 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h1
                        style={{
                            fontSize: '28px',
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            margin: '4px 0 0 0',
                            color: 'var(--text-primary)',
                        }}
                    >
                        Automation
                    </h1>

                    <div
                        style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: STATUS_COLOR[status] ?? 'var(--text-muted)',
                        }}
                    >
                        {STATUS_LABEL[status] ?? status}
                    </div>
                </div>

                {isRunning && (
                    <div
                        style={{
                            width: '100%',
                            height: '3px',
                            backgroundColor: 'var(--border)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.max(progress, 8)}%`,
                                height: '100%',
                                backgroundColor: '#a855f7',
                                borderRadius: '2px',
                                transition: 'width 250ms ease',
                            }}
                        />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                <div
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '24px',
                        flex: '2 1 500px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                            </svg>

                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                Current Activity
                            </h3>
                        </div>

                        {isRunning && (
                            <span
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Live Session
                            </span>
                        )}
                    </div>

                    {!isRunning && !currentCourseText && (
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            No run is currently active.
                        </div>
                    )}

                    {(currentCourseText || currentModuleText || currentActionText) && (
                        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    Active Course
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {currentCourseText ?? '—'}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    Current Module
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {currentModuleText ?? '—'}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                    Current Action
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {currentActionText ?? '—'}
                                </div>
                            </div>

                            {runtime?.modules_total ? (
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                        Progress
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {runtime.modules_processed}/{runtime.modules_total} · {runtime.module_progress_percent}%
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <PilotMiniGame />
            </div>

            <LiveActivityLog logs={logs} />
        </div>
    );
}