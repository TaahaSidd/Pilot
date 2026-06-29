// src/components/automation/ProcessorLoad.tsx
import React from 'react';
import { Square } from 'lucide-react';

interface ProcessorLoadProps {
    percentage: number;
    onStop?: () => void;
}

export function ProcessorLoad({ percentage, onStop }: ProcessorLoadProps) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flex: '1 1 280px'
        }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Processor Load
            </span>

            {/* Radial SVG Track Container */}
            <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="48" cy="48" r={radius} stroke="var(--border)" strokeWidth="8" fill="transparent" />
                    <circle
                        cx="48" cy="48" r={radius}
                        stroke="#a855f7" strokeWidth="8" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {percentage}%
                </div>
            </div>

            {/* Universal Interrupt Automation Trigger */}
            <button
                onClick={onStop}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
                <Square size={12} fill="currentColor" /> Stop Automation
            </button>
        </div>
    );
}