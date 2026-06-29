import React from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { ProcessorLoad } from '../components/automation/ProcessorLoad';
import { LiveActivityLog } from '../components/automation/LiveActivityLog';
import type { LogEvent } from '../hooks/usePilot';

interface AutomationScreenProps {
    liveLogs: LogEvent[];
    status: string;
}

export function AutomationScreen({ liveLogs, status }: AutomationScreenProps) {

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* 1. Header Banner & Processing Sequence Tracker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                            Automation Dashboard
                        </h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#a855f7', lineHeight: '1' }}>75%</div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Step 4 of 6 completed</span>
                    </div>
                </div>

                {/* Main Wide Track Sequence Progress Bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', backgroundColor: '#a855f7', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
            </div>

            {/* 2. Dual Panel Mid-Section Data Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>

                {/* Panel Left: Execution Context Canvas Card */}
                <div style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '24px',
                    flex: '2 1 500px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '32px'
                }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                </svg>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Current Activity</h3>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                Live Session
                            </span>
                        </div>

                        {/* Informational Columns Layout */}
                        <div style={{ display: 'flex', gap: '48px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Active Course</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Advanced Algorithms</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Current Task</div>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Graph Theory</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Runtime Clocks */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                            <span>Run time: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>37m 22s</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <Hourglass size={14} style={{ color: 'var(--text-muted)' }} />
                            <span>Estimated remaining: <strong style={{ color: '#ffbb33', fontWeight: 500 }}>12m 40s</strong></span>
                        </div>
                    </div>
                </div>

                {/* Panel Right: Core Processor Compute Metric Instrumentation */}
                <ProcessorLoad percentage={80} onStop={() => console.log('Stop requested.')} />
            </div>

            {/* 3. Bottom Embedded Activity Log Console Wrapper */}
            <LiveActivityLog logs={liveLogs} />

        </div>
    );
}