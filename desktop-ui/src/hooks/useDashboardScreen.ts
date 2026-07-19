import { useState } from 'react';
import { usePilotContext } from '../context/usePilotContext';

type DashboardAction = 'workflow' | 'stop' | 'notes';

export type ActionRequiredNotice = {
    id: string;
    title: string;
    message: string;
    severity: 'warning' | 'error';
    dismissible?: boolean;
};

function getActionRequiredNotice({
    awaitingLogin,
    status,
    logs,
    runtimeError,
}: {
    awaitingLogin: boolean;
    status: string;
    logs: Array<{ message: unknown }>;
    runtimeError?: string | null;
}): ActionRequiredNotice | null {
    const recentText = logs
        .slice(-12)
        .map((entry) => typeof entry.message === 'string' ? entry.message.toLowerCase() : JSON.stringify(entry.message).toLowerCase())
        .join(' ');

    if (awaitingLogin) {
        return {
            id: 'login-verification',
            title: 'Login verification required',
            message: 'Complete the CAPTCHA in the browser, then continue.',
            severity: 'warning',
        };
    }

    if (recentText.includes('groq api limit reached')) {
        return {
            id: 'groq-quota',
            title: 'Groq quota reached',
            message: 'Notes generation stopped because your Groq quota was exhausted.',
            severity: 'error',
            dismissible: true,
        };
    }

    if (status === 'error') {
        return {
            id: 'runtime-error',
            title: 'Pilot needs attention',
            message: runtimeError ?? 'Pilot ran into a problem and cannot continue this run.',
            severity: 'error',
            dismissible: true,
        };
    }

    return null;
}

export function useDashboardScreen() {
    const pilot = usePilotContext();
    const [pendingAction, setPendingAction] = useState<DashboardAction | null>(null);
    const [dismissedNoticeId, setDismissedNoticeId] = useState<string | null>(null);

    const isRunning = pilot.status === 'running';
    const isDashboardLoading = pilot.statusLoading || pilot.coursesLoading;
    const userName = pilot.config?.display_name || pilot.config?.username || 'there';
    const actionRequiredNotice = getActionRequiredNotice({
        awaitingLogin: pilot.awaitingLogin,
        status: pilot.status,
        logs: pilot.logs,
        runtimeError: pilot.runtime?.error,
    });
    const shouldShowActionNotice = actionRequiredNotice && dismissedNoticeId !== actionRequiredNotice.id;

    async function runDashboardAction(action: DashboardAction) {
        try {
            setPendingAction(action);

            if (action === 'workflow') {
                await pilot.startWorkflow();
                return;
            }

            if (action === 'notes') {
                await pilot.startNotes();
                return;
            }

            await pilot.stopRuntime(true);
        } catch {
            // The notification/runtime layer reports user-facing failures.
        } finally {
            setPendingAction(null);
        }
    }

    function dismissNotice(id: string) {
        setDismissedNoticeId(id);
    }

    return {
        ...pilot,
        actionRequiredNotice,
        dismissNotice,
        isDashboardLoading,
        isRunning,
        pendingAction,
        runDashboardAction,
        shouldShowActionNotice,
        userName,
    };
}
