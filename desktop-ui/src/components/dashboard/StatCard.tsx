// src/components/dashboard/StatCard.tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    // Changed subtext to accept React node elements or strings for rich layouts
    subtext: React.ReactNode;
    icon: LucideIcon;
}

export function StatCard({ title, value, subtext, icon: IconComponent }: StatCardProps) {
    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px', // Matches 12px container radius specification
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px', // Slight increase to let text groupings breathe comfortably
            flex: 1,
            minWidth: '220px',
            transition: 'border-color 150ms ease'
        }}>
            {/* Card Header row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500
            }}>
                <span style={{ letterSpacing: '-0.01em' }}>{title}</span>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <IconComponent size={16} strokeWidth={2} />
                </span>
            </div>

            {/* Metrics Focus Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: '34px'
                }}>
                    {value}
                </div>

                {/* Flexible descriptive footer region for trend chips and engine telemetry */}
                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: '16px'
                }}>
                    {subtext}
                </div>
            </div>
        </div>
    );
}