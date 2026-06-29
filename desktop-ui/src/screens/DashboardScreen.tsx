// src/screens/DashboardScreen.tsx
import React from 'react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { InterventionBanner } from '../components/dashboard/InterventionBanner';
import { CourseGrid } from '../components/dashboard/CourseGrid';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { Button } from '../components/shared/Button';
import { Play, FileText, GlobeOff, Square } from 'lucide-react'; // Added Square for the stop run condition if preferred

interface DashboardScreenProps {
    status: string;
    configured: boolean;
    logsLength: number;
    awaitingLogin: boolean;
    startWorkflow: () => void;
    startNotes: () => void;
    confirmLogin: () => void;
    toggleBrowser: () => void;
}

export function DashboardScreen({
    status,
    configured,
    logsLength,
    awaitingLogin,
    startWorkflow,
    startNotes,
    confirmLogin,
    toggleBrowser
}: DashboardScreenProps) {
    const isRunning = status === 'running';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            paddingBottom: '32px'
        }}>

            {/* Header Flex Row Context Block */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '20px'
            }}>
                {/* Left Side: Greetings */}
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                        Good morning, Student
                    </h1>
                    <p style={{ color: '', fontSize: '13px', margin: 0 }}>
                        Your autonomous study agents have completed <span style={{ color: 'var(--accent)', fontWeight: 600 }}>12 modules</span> while you were away.
                    </p>
                </div>

                {/* Right Side: Control Actions Ordered From Left to Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* 1. Start Automation / Stop Run (First from left) */}
                    <Button
                        variant={isRunning ? "danger" : "primary"}
                        icon={isRunning ? Square : Play}
                        onClick={startWorkflow}
                    >
                        {isRunning ? "Stop Run" : "Start Automation"}
                    </Button>

                    {/* 2. Notes Agent (Icon only) */}
                    <Button
                        variant="secondary"
                        icon={FileText}
                        onClick={startNotes}
                        style={{ padding: '9px 10px' }}
                        title="Notes Agent"
                    >
                        {""}
                    </Button>

                    {/* 3. Toggle Sandbox Browser View (Icon only using GlobeOff) */}
                    <Button
                        variant="outline"
                        icon={GlobeOff}
                        onClick={toggleBrowser}
                        style={{ padding: '9px 10px' }}
                        title="Toggle Sandbox Browser View"
                    >
                        {""}
                    </Button>
                </div>
            </div>

            {/* System Banners */}
            {awaitingLogin && (
                <InterventionBanner
                    awaitingLogin={awaitingLogin}
                    confirmLogin={confirmLogin}
                />
            )}

            {/* Core Overview Telemetry Grid */}
            <StatsGrid
                status={status}
                configured={configured}
                logsLength={logsLength}
            />

            {/* Split Screen Panel Architecture */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                alignItems: 'start'
            }}>
                <CourseGrid />
                <ActivityFeed />
            </div>
        </div>
    );
}