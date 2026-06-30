import React, { useState } from 'react';
import { SettingRow } from '../components/settings/SettingRow';
import { IdentitySettingsScreen } from './IdentitySettingsScreen';
import { ThemeSettingsScreen } from './ThemeSettingsScreen'; // Ensure this is imported
import { useTheme } from '../context/ThemeContext';

export function SettingsScreen() {
    const [isEditingIdentity, setIsEditingIdentity] = useState(false);
    const [isEditingTheme, setIsEditingTheme] = useState(false); // ◄ Added state
    const { theme } = useTheme();

    // Navigation logic: Prioritize sub-screen views
    if (isEditingIdentity) {
        return <IdentitySettingsScreen onBack={() => setIsEditingIdentity(false)} />;
    }

    if (isEditingTheme) {
        return <ThemeSettingsScreen onBack={() => setIsEditingTheme(false)} />; // ◄ Added navigation
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                    Manage your account, appearance, and automation preferences.
                </p>
            </div>

            {/* Account & Security */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Account & Security
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Profile & API Keys"
                        description="Update your name, Amity login details, or your Groq API key."
                        actionLabel="Manage"
                        onClick={() => setIsEditingIdentity(true)}
                    />
                    <SettingRow
                        label="Amity Server Status"
                        description="Check your connection to the Amity campus portal."
                        actionLabel="Connected"
                        onClick={() => console.log('Check status')}
                    />
                </div>
            </div>

            {/* Appearance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Appearance
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Theme Profiles"
                        description="Switch between light, dark, and system modes."
                        actionLabel={theme.charAt(0).toUpperCase() + theme.slice(1)}
                        onClick={() => setIsEditingTheme(true)} // ◄ Navigation trigger
                    />
                    <SettingRow
                        label="Privacy"
                        description="Control what data is stored and how we handle your logs."
                        onClick={() => console.log('Privacy settings')}
                    />
                </div>
            </div>

            {/* Automation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Automation
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingRow
                        label="Browser Settings"
                        description="Adjust window scaling and how the automation runs."
                        onClick={() => console.log('Browser settings')}
                    />
                    <SettingRow
                        label="Performance"
                        description="Choose how many tasks run at once to save your computer's resources."
                        actionLabel="Balanced"
                        onClick={() => console.log('Performance settings')}
                    />
                </div>
            </div>
        </div>
    );
}