import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from '@tauri-apps/plugin-notification';

function isTauriRuntime() {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function notificationId(seed: string) {
    let hash = 0;

    for (let index = 0; index < seed.length; index += 1) {
        hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
}

export async function ensureNativeNotificationPermission() {
    if (!isTauriRuntime()) {
        return false;
    }

    try {
        if (await isPermissionGranted()) {
            return true;
        }

        const permission = await requestPermission();
        return permission === 'granted';
    } catch {
        return false;
    }
}

export async function sendNativePilotNotification({
    id,
    title,
    message,
}: {
    id: string;
    title: string;
    message: string;
}) {
    const permitted = await ensureNativeNotificationPermission();

    if (!permitted) {
        return;
    }

    try {
        sendNotification({
            id: notificationId(id),
            title,
            body: message,
            autoCancel: true,
        });
    } catch {
        // Native notification failures should never interrupt Pilot.
    }
}

