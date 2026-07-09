import React from 'react';
import { GraduationCap } from 'lucide-react';
import { PilotMiniGame } from '../components/automation/PilotMiniGame';
import { LiveActivityLog } from '../components/automation/LiveActivityLog';
import { usePilotContext } from '../context/usePilotContext';

function CompactField({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {label}
            </div>
            <div
                title={value}
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
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

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getActivityText(action: string | null, module: string | null) {
    if (!action) {
        return 'No active automation run.';
    }

    if (!module) {
        return action;
    }

    return action
        .replace(new RegExp(`:\\s*${escapeRegExp(module)}$`), '')
        .trim();
}

function getSnapshotText(status: string, action: string | null, module: string | null, course: string | null) {
    if (status === 'running') {
        return getActivityText(action, module);
    }

    return module ?? course ?? 'No recent session data.';
}

export function AutomationScreen() {
    const { logs, status, runtime } = usePilotContext();

    const isRunning = status === 'running';
    const currentCourseText = runtime?.current_course ?? null;
    const currentModuleText = runtime?.current_module ?? null;
    const currentActionText = runtime?.current_action_label ?? null;
    const progress = runtime?.module_progress_percent ?? 0;
    const progressText = runtime?.modules_total
        ? `${runtime.modules_processed}/${runtime.modules_total} modules, ${runtime.module_progress_percent}%`
        : 'Waiting for module data';
    const primaryActivityText = getSnapshotText(status, currentActionText, currentModuleText, currentCourseText);
    const taskLabel = isRunning ? 'Activity' : 'Last task';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h1
                    style={{
                        fontSize: '28px',
                        fontWeight: 600,
                        letterSpacing: 0,
                        margin: '4px 0 0 0',
                        color: 'var(--text-primary)',
                    }}
                >
                    Automation
                </h1>

                {isRunning && (
                    <div
                        style={{
                            width: '100%',
                            height: '3px',
                            backgroundColor: 'var(--border)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.max(progress, 8)}%`,
                                height: '100%',
                                backgroundColor: 'var(--accent)',
                                borderRadius: '2px',
                                transition: 'width 250ms ease',
                            }}
                        />
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'stretch' }}>
                <div
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        minWidth: 0,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <GraduationCap size={18} color="var(--accent)" />
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                Session Snapshot
                            </h3>
                        </div>

                        {isRunning && (
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    flexShrink: 0,
                                }}
                            >
                                Live
                            </span>
                        )}
                    </div>

                    <div
                        style={{
                            backgroundColor: 'var(--surface-subtle)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            padding: '16px',
                            minWidth: 0,
                        }}
                    >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            {taskLabel}
                        </div>
                        <div
                            title={primaryActivityText}
                            style={{
                                color: isRunning ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontSize: '15px',
                                fontWeight: isRunning ? 600 : 500,
                                lineHeight: '22px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {primaryActivityText}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: '14px',
                        }}
                    >
                        <CompactField label="Course" value={currentCourseText ?? 'None selected'} />
                        <CompactField label="Module" value={currentModuleText ?? 'None active'} />
                        <CompactField label="Progress" value={progressText} />
                        <CompactField label="Run type" value={runtime?.run_type ?? 'None'} />
                    </div>
                </div>

                <PilotMiniGame />
            </div>

            <LiveActivityLog logs={logs} />
        </div>
    );
}
