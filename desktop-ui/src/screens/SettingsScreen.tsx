import { useEffect, useState } from 'react';
import { SettingRow } from '../components/settings/SettingRow';
import { IdentitySettingsScreen } from './IdentitySettingsScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: 0, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                    Manage your account, updates, privacy, and study preferences.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Account & Security
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Profile & API Keys"
                        description="Update your name, Amity login details, or your Groq API key."
                        actionLabel="Manage"
                        onClick={() => setActiveScreen('identity')}
                    />
                    <SettingRow
                        label="Amity Server Status"
                        description="Check your connection to the Amity campus portal."
                        actionLabel="Connected"
                        onClick={() => console.log('Check status')}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Updates
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Update Preferences"
                        description="Choose which Pilot updates should appear as notifications."
                        actionLabel="Manage"
                        onClick={() => setActiveScreen('notifications')}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Privacy
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Privacy"
                        description="Control what data is stored and how Pilot handles your logs."
                        onClick={() => console.log('Privacy settings')}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Study Preferences
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Study Session Behavior"
                        description="Choose how Pilot opens Amity and handles study runs."
                        onClick={() => console.log('Browser settings')}
                    />
                    <SettingRow
                        label="Performance"
                        description="Choose how much work Pilot should handle at once."
                        actionLabel="Balanced"
                        onClick={() => console.log('Performance settings')}
                    />
                </div>
            </div>
        </div>
    );
}
