// src/components/dashboard/StatsGrid.tsx
import React from 'react';
import { StatCard } from './StatCard';
import { Activity, ShieldCheck, Cpu, Database } from 'lucide-react';

interface StatsGridProps {
    status: string;
    configured: boolean;
    logsLength: number;
}

export function StatsGrid({ status, configured, logsLength }: StatsGridProps) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
        }}>
            {/* 1. Hours Saved */}
            <StatCard
                title="Hours Saved"
                value="142.5"
                icon={Activity}
                subtext={
                    <div style={{ marginTop: '8px', width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '72%', height: '100%', backgroundColor: 'var(--accent)' }} />
                    </div>
                }
            />

            {/* 2. Modules Completed */}
            <StatCard
                title="Modules Completed"
                value="24"
                icon={ShieldCheck}
                subtext={
                    <span style={{ color: 'var(--tertiary)', fontWeight: 500 }}>
                        +3 since yesterday
                    </span>
                }
            />

            {/* 3. Model Token Usage */}
            <StatCard
                title="Tokens Consumed"
                value="1.2M"
                icon={Cpu}
                subtext="Llama-3 & Groq-1"
            />

            {/* 4. Local Knowledge Storage */}
            <StatCard
                title="Knowledge Base"
                value="842 MB"
                icon={Database}
                subtext="Synced with Amity Server"
            />
        </div>
    );
}