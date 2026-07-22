import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { Toast } from '../components/shared/Toast';
import { usePilotContext } from './usePilotContext';
import type { LogEvent } from '../hooks/usePilot';
import { formatUserFacingError } from '../utils/userFacingError';
import { ensureNativeNotificationPermission, sendNativePilotNotification } from '../utils/nativeNotifications';
import { playNotificationSound } from '../utils/notificationSound';

export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'action_required';
export type NotificationSource = 'workflow' | 'notes' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationPreferences {
    enabled: boolean;
    showToasts: boolean;
    playSound: boolean;
    nativeNotifications: boolean;
    completionNotifications: boolean;
    loginAlerts: boolean;
    errorNotifications: boolean;
    stoppedNotifications: boolean;
    progressNotifications: boolean;
}

export interface PilotNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    dismissible: boolean;
    source?: NotificationSource;
    priority: NotificationPriority;
    persistent: boolean;
    playSound: boolean;
    nativeNotification: boolean;
}

type NotificationDraft = Omit<PilotNotification, 'id' | 'createdAt' | 'read'>;

interface NotificationContextValue {
    notifications: PilotNotification[];
    unreadCount: number;
    preferences: NotificationPreferences;
    notify: (notification: NotificationDraft) => void;
    updatePreferences: (updates: Partial<NotificationPreferences>) => void;
    dismissToast: () => void;
    markAllRead: () => void;
    markRead: (id: string) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const NOTIFICATION_PREFS_KEY = 'pilot_notification_preferences';

const defaultPreferences: NotificationPreferences = {
    enabled: true,
    showToasts: true,
    playSound: false,
    nativeNotifications: false,
    completionNotifications: true,
    loginAlerts: true,
    errorNotifications: true,
    stoppedNotifications: true,
    progressNotifications: true,
};

function loadPreferences(): NotificationPreferences {
    try {
        const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY);

        if (!saved) {
            return defaultPreferences;
        }

        return {
            ...defaultPreferences,
            ...JSON.parse(saved),
        };
    } catch {
        return defaultPreferences;
    }
}

function toToastType(type: NotificationType) {
    if (type === 'success') return 'success';
    if (type === 'warning' || type === 'action_required') return 'warning';
    if (type === 'error') return 'error';
    return 'normal';
}

function createId() {
    return `notification_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function logMessage(log: LogEvent) {
    return typeof log.message === 'string'
        ? log.message.toLowerCase()
        : JSON.stringify(log.message).toLowerCase();
}

function runSource(runType: string | null | undefined): NotificationSource {
    return runType === 'notes' ? 'notes' : 'workflow';
}

function shouldCreateNotification(notification: NotificationDraft, preferences: NotificationPreferences) {
    if (!preferences.enabled) {
        return false;
    }

    if (notification.type === 'action_required') {
        return preferences.loginAlerts;
    }

    if (notification.type === 'error') {
        return preferences.errorNotifications;
    }

    if (notification.type === 'warning' && notification.title.toLowerCase().includes('stopped')) {
        return preferences.stoppedNotifications;
    }

    if (notification.type === 'success' && notification.priority === 'high') {
        return preferences.completionNotifications;
    }

    if (notification.type === 'info' || notification.priority === 'normal' || notification.priority === 'low') {
        return preferences.progressNotifications;
    }

    return true;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { status, awaitingLogin, logs, runtime } = usePilotContext();
    const [notifications, setNotifications] = useState<PilotNotification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences>(loadPreferences);
    const [activeToast, setActiveToast] = useState<PilotNotification | null>(null);
    const previousStatusRef = useRef(status);
    const awaitingLoginNotifiedRef = useRef(false);
    const processedLogIdsRef = useRef(new Set<string>());
    const emittedKeysRef = useRef(new Set<string>());

    const notify = useCallback((draft: NotificationDraft) => {
        if (!shouldCreateNotification(draft, preferences)) {
            return;
        }

        const notification: PilotNotification = {
            ...draft,
            playSound: preferences.playSound && draft.playSound,
            nativeNotification: preferences.nativeNotifications && draft.nativeNotification,
            id: createId(),
            createdAt: new Date().toISOString(),
            read: false,
        };

        setNotifications((current) => [notification, ...current]);

        if (preferences.showToasts && notification.priority !== 'low') {
            setActiveToast(notification);
        }

        if (notification.playSound) {
            playNotificationSound();
        }

        if (notification.nativeNotification) {
            void sendNativePilotNotification({
                id: notification.id,
                title: notification.title,
                message: notification.message,
            });
        }
    }, [preferences]);

    const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
        setPreferences((current) => {
            const next = { ...current, ...updates };
            localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));

            if (!next.enabled || !next.showToasts) {
                setActiveToast(null);
            }

            return next;
        });

        if (updates.nativeNotifications === true) {
            void ensureNativeNotificationPermission().then((granted) => {
                if (!granted) {
                    setPreferences((current) => {
                        const next = { ...current, nativeNotifications: false };
                        localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
                        return next;
                    });
                }
            });
        }
    }, []);

    const emitOnce = useCallback((key: string, draft: NotificationDraft) => {
        if (emittedKeysRef.current.has(key)) {
            return;
        }

        emittedKeysRef.current.add(key);
        notify(draft);
    }, [notify]);

    useEffect(() => {
        if (awaitingLogin && !awaitingLoginNotifiedRef.current) {
            awaitingLoginNotifiedRef.current = true;
            notify({
                type: 'action_required',
                title: 'Login verification required',
                message: 'Finish the CAPTCHA or login check in the browser, then continue.',
                dismissible: true,
                source: 'system',
                priority: 'critical',
                persistent: true,
                playSound: true,
                nativeNotification: true,
            });
        }

        if (!awaitingLogin) {
            awaitingLoginNotifiedRef.current = false;
        }
    }, [awaitingLogin, notify]);

    useEffect(() => {
        const previous = previousStatusRef.current;

        if (previous !== status) {
            if (status === 'running') {
                notify({
                    type: 'info',
                    title: runtime?.run_type === 'notes' ? 'Notes generation started' : 'Study session started',
                    message: 'Pilot is working. You can keep using the app while it runs.',
                    dismissible: true,
                    source: runSource(runtime?.run_type),
                    priority: 'normal',
                    persistent: false,
                    playSound: false,
                    nativeNotification: false,
                });
            }

            if (status === 'done') {
                notify({
                    type: 'success',
                    title: runtime?.run_type === 'notes' ? 'Notes generated' : 'Study session completed',
                    message: runtime?.run_type === 'notes'
                        ? 'Your generated notes are ready to browse.'
                        : 'Pilot finished the latest study run.',
                    dismissible: true,
                    source: runSource(runtime?.run_type),
                    priority: 'high',
                    persistent: false,
                    playSound: true,
                    nativeNotification: true,
                });
            }

            if (status === 'stopped') {
                notify({
                    type: 'warning',
                    title: 'Run stopped',
                    message: 'Pilot stopped the current study session.',
                    dismissible: true,
                    source: runSource(runtime?.run_type),
                    priority: 'high',
                    persistent: false,
                    playSound: false,
                    nativeNotification: true,
                });
            }

            if (status === 'error') {
                notify({
                    type: 'error',
                    title: 'Study session failed',
                    message: formatUserFacingError(runtime?.error),
                    dismissible: true,
                    source: runSource(runtime?.run_type),
                    priority: 'critical',
                    persistent: true,
                    playSound: true,
                    nativeNotification: true,
                });
            }

            previousStatusRef.current = status;
        }
    }, [status, runtime?.error, runtime?.run_type, notify]);

    useEffect(() => {
        logs.forEach((log) => {
            if (processedLogIdsRef.current.has(log._id)) {
                return;
            }

            processedLogIdsRef.current.add(log._id);
            const text = logMessage(log);

            if (text.includes('groq api limit reached')) {
                emitOnce('groq_quota_reached', {
                    type: 'error',
                    title: 'Groq quota reached',
                    message: 'Notes generation stopped because the API quota has been reached.',
                    dismissible: true,
                    source: 'notes',
                    priority: 'critical',
                    persistent: true,
                    playSound: true,
                    nativeNotification: true,
                });
            }

            if (text.includes('notes generation complete') || text.includes('notes generated')) {
                emitOnce(`notes_complete_${log._id}`, {
                    type: 'success',
                    title: 'Notes generated',
                    message: 'Your latest notes are ready to browse.',
                    dismissible: true,
                    source: 'notes',
                    priority: 'high',
                    persistent: false,
                    playSound: true,
                    nativeNotification: true,
                });
            }
        });
    }, [logs, emitOnce]);

    const value = useMemo<NotificationContextValue>(() => ({
        notifications,
        unreadCount: notifications.filter((notification) => !notification.read).length,
        preferences,
        notify,
        updatePreferences,
        dismissToast: () => setActiveToast(null),
        markAllRead: () => setNotifications((current) => current.map((notification) => ({ ...notification, read: true }))),
        markRead: (id) => setNotifications((current) => current.map((notification) => (
            notification.id === id ? { ...notification, read: true } : notification
        ))),
        clearNotifications: () => {
            setNotifications([]);
            setActiveToast(null);
        },
    }), [notifications, preferences, notify, updatePreferences]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {activeToast && (
                <Toast
                    message={`${activeToast.title}: ${activeToast.message}`}
                    type={toToastType(activeToast.type)}
                    persistent={false}
                    position="bottom-center"
                    onClose={() => setActiveToast(null)}
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotifications must be used inside <NotificationProvider>');
    }

    return context;
}
