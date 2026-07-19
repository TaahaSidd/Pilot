// src/components/dashboard/ActionDeck.tsx
import { Play, FileText, Eye } from 'lucide-react';
import { Button } from '../ui';

interface ActionDeckProps {
    status: string;
    startWorkflow: () => void;
    startNotes: () => void;
    toggleBrowser: () => void;
}

export function ActionDeck({ status, startWorkflow, startNotes, toggleBrowser }: ActionDeckProps) {
    const isRunning = status === 'running';

    return (
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
            <Button
                variant="primary"
                icon={Play}
                onClick={startWorkflow}
                disabled={isRunning}
            >
                {isRunning ? 'Study run in progress' : 'Start Study Run'}
            </Button>

            <Button
                variant="secondary"
                icon={FileText}
                onClick={startNotes}
                disabled={isRunning}
            >
                Generate Notes
            </Button>

            <Button
                variant="ghost"
                icon={Eye}
                onClick={toggleBrowser}
            >
                Browser
            </Button>
        </div>
    );
}
