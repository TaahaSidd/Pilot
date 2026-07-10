import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SettingRow } from '../components/settings/SettingRow';
import { IdentitySettingsScreen } from './IdentitySettingsScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';

const APP_VERSION = '0.0.0';
const PILOT_REPO_URL = 'https://github.com/TaahaSidd/Pilot';

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                {title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    );
}

export function SettingsScreen({
    initialView,
    onInitialViewHandled,
}: {
    initialView?: 'identity' | null;
    onInitialViewHandled?: () => void;
}) {
    const [activeScreen, setActiveScreen] = useState<'settings' | 'identity' | 'notifications'>('settings');

    useEffect(() => {
        if (initialView === 'identity') {
            setActiveScreen('identity');
            onInitialViewHandled?.();
        }
    }, [initialView, onInitialViewHandled]);

    if (activeScreen === 'identity') {
        return <IdentitySettingsScreen onBack={() => setActiveScreen('settings')} />;
    }

    if (activeScreen === 'notifications') {
        return <NotificationSettingsScreen onBack={() => setActiveScreen('settings')} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '860px', minHeight: '100%' }}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: 0, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                    Manage your account, notifications, and Pilot app information.
                </p>
            </div>

            <Section title="Account">
                <SettingRow
                    label="Profile and Amity login"
                    description="Update your display name, Amity username, password, and phone number."
                    actionLabel="Manage"
                    onClick={() => setActiveScreen('identity')}
                />
            </Section>

            <Section title="Notifications">
                <SettingRow
                    label="Notification preferences"
                    description="Choose which study updates Pilot should show."
                    actionLabel="Manage"
                    onClick={() => setActiveScreen('notifications')}
                />
            </Section>

            <Section title="About">
                <SettingRow
                    label="Pilot version"
                    description={`Version ${APP_VERSION}`}
                    actionLabel="Current"
                />
                <SettingRow
                    label="Check for updates"
                    description="Update checking will be added in a future release."
                    actionLabel="Soon"
                />
                <SettingRow
                    label="License"
                    description="Pilot license information."
                    actionLabel="View"
                />
            </Section>

            <footer
                style={{
                    marginTop: 'auto',
                    paddingTop: '26px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '24px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <img
                        src="/PilotSVG.svg"
                        alt="Pilot"
                        style={{
                            width: '92px',
                            height: '34px',
                            objectFit: 'contain',
                            opacity: 0.9,
                        }}
                    />
                    <span>Study Assistant for Amity students.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                    <button
                        type="button"
                        onClick={() => window.open(PILOT_REPO_URL, '_blank', 'noopener,noreferrer')}
                        style={{
                            border: 0,
                            background: 'transparent',
                            padding: 0,
                            color: 'var(--text-secondary)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            font: 'inherit',
                        }}
                    >
                        GitHub
                    </button>
                    <button
                        type="button"
                        onClick={() => window.open(`${PILOT_REPO_URL}/issues`, '_blank', 'noopener,noreferrer')}
                        style={{
                            border: 0,
                            background: 'transparent',
                            padding: 0,
                            color: 'var(--text-secondary)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            font: 'inherit',
                        }}
                    >
                        Report problem
                    </button>
                </div>
            </footer>
        </div>
    );
}
