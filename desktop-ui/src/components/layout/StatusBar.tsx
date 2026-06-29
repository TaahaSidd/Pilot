// src/components/layout/StatusBar.tsx
import React from 'react';

interface StatusBarProps {
    wsState: string;
    status: string;
}

export function StatusBar({ wsState, status }: StatusBarProps) {
    return (
        <header style={{
            height: '48px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Pushes children to opposite ends
            padding: '0 24px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--background)'
        }}>
            {/* Left Section (Empty placeholder to let flexbox push things right, or for breadcrumbs) */}
            <div style={{ visibility: 'hidden' }} />

            {/* Right Section containing all diagnostic metrics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Clean Connection Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Engine:</span>
                    <strong style={{
                        color: wsState === 'open' ? 'var(--success)' : 'var(--error)',
                        fontWeight: 600
                    }}>
                        {wsState === 'open' ? 'CONNECTED' : 'DISCONNECTED'}
                    </strong>
                </div>

                {/* Clean Operational State */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Mode:</span>
                    <span style={{
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                    }}>
                        {status || 'IDLE'}
                    </span>
                </div>
            </div>
        </header>
    );
}