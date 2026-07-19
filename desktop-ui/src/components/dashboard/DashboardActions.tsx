import { FileText, Play, Square } from 'lucide-react';
import { Button } from '../ui';

interface DashboardActionsProps {
    configured: boolean;
    isRunning: boolean;
    pendingAction: 'workflow' | 'stop' | 'notes' | null;
    onRunAction: (action: 'workflow' | 'stop' | 'notes') => void;
}

export function DashboardActions({
    configured,
    isRunning,
    pendingAction,
    onRunAction,
}: DashboardActionsProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
                data-tour-id="start-study-run"
                variant={isRunning ? 'danger' : 'primary'}
                icon={isRunning ? Square : Play}
                onClick={() => onRunAction(isRunning ? 'stop' : 'workflow')}
                disabled={!configured || pendingAction !== null}
                loading={pendingAction === 'workflow' || pendingAction === 'stop'}
                loadingText={pendingAction === 'stop' ? 'Stopping' : 'Starting'}
            >
                {isRunning ? 'Stop' : 'Start Study Run'}
            </Button>

            <Button
                data-tour-id="generate-notes"
                variant="secondary"
                icon={FileText}
                onClick={() => onRunAction('notes')}
                disabled={!configured || isRunning || pendingAction !== null}
                loading={pendingAction === 'notes'}
            >
                Generate Notes
            </Button>
        </div>
    );
}
