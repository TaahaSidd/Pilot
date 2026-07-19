import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SettingRow } from '../components/settings/SettingRow';
import { PageHeader } from '../components/ui';
import { openExternalUrl } from '../utils/openExternal';
import { IdentitySettingsScreen } from './IdentitySettingsScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import tauriConfig from '../../src-tauri/tauri.conf.json';

const APP_VERSION = tauriConfig.version;
const PILOT_REPO_URL = 'https://github.com/TaahaSidd/Pilot';

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h2 className="pilot-type-section-title" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </section>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 'var(--layout-readable)', margin: '0 auto', width: '100%', minHeight: '100%' }}>
            <PageHeader
                title="Settings"
                description="Manage your account, notifications, and Pilot app information."
            />

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
                    paddingTop: 'var(--space-6)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 'var(--space-6)',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--type-body-small-size)',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--type-body-small-size)' }}>
                    <button
                        type="button"
                        onClick={() => void openExternalUrl(PILOT_REPO_URL)}
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
                        onClick={() => void openExternalUrl(`${PILOT_REPO_URL}/issues`)}
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
