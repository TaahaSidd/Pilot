// src/components/dashboard/ActionDeck.tsx
import React from 'react';
import { Play, FileText, Eye } from 'lucide-react';

interface ActionDeckProps {
    status: string;
    startWorkflow: () => void;
    startNotes: () => void;
    toggleBrowser: () => void;
}

export function ActionDeck({ status, startWorkflow, startNotes, toggleBrowser }: ActionDeckProps) {
    const isRunning = status === 'running';

    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <button
                onClick={startWorkflow}
                disabled={isRunning}
                style={{
                    backgroundColor: 'var(--accent)',
                    color: '#FFF',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    opacity: isRunning ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 150ms'
                }}
            >
                <Play size={16} fill="currentColor" />
                {isRunning ? 'Processing Run...' : 'Start Automation'}
            </button>

            <button
                onClick={startNotes}
                disabled={isRunning}
                style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    opacity: isRunning ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 150ms'
                }}
            >
                <FileText size={16} />
                Generate Study Notes
            </button>

            <button
                onClick={toggleBrowser}
                style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontWeight: 500,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <Eye size={16} />
                Show/Hide Browser Window
            </button>
        </div>
    );
}