import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../components/shared/Button';
import { useNotifications, type NotificationPreferences } from '../context/NotificationContext';

function SwitchRow({
    label,
    description,
    checked,
    disabled = false,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '18px',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.54 : 1,
            }}
        >
            <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: 0 }}>
                    {label}
                </span>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '16px' }}>
                    {description}
                </span>
            </span>

            <span
                style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: '999px',
                    padding: '3px',
                    backgroundColor: checked ? 'var(--accent)' : 'var(--surface-subtle)',
                    border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'background-color 150ms ease, border-color 150ms ease',
                    flex: '0 0 auto',
                }}
            >
                <span
                    style={{
                        display: 'block',
                        width: '16px',
                        height: '16px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--text-on-accent)',
                        transform: checked ? 'translateX(18px)' : 'translateX(0)',
                        transition: 'transform 150ms ease',
                    }}
                />
            </span>

            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.target.checked)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            />
        </label>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section style={{ display: 'grid', gap: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                {title}
            </h2>
            <div
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '2px 16px',
                }}
            >
                {children}
            </div>
        </section>
    );
}

export function NotificationSettingsScreen({ onBack }: { onBack: () => void }) {
    const { preferences, updatePreferences } = useNotifications();
    const enabled = preferences.enabled;
    const setPreference = <Key extends keyof NotificationPreferences>(key: Key, value: NotificationPreferences[Key]) => {
        updatePreferences({ [key]: value });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '860px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                    Back to Settings
                </Button>
            </div>

            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: 0, margin: 0, color: 'var(--text-primary)' }}>
                    Notifications
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '20px', margin: '6px 0 0' }}>
                    Choose which Pilot updates you want to see.
                </p>
            </div>

            <Section title="General">
                <SwitchRow
                    label="In-app notifications"
                    description="Show important Pilot updates inside the app."
                    checked={preferences.enabled}
                    onChange={(checked) => setPreference('enabled', checked)}
                />
                <SwitchRow
                    label="Toast messages"
                    description="Show short messages at the bottom of the screen."
                    checked={preferences.showToasts}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('showToasts', checked)}
                />
                <SwitchRow
                    label="Desktop notifications"
                    description="Prepare Pilot updates for native Windows notifications."
                    checked={preferences.nativeNotifications}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('nativeNotifications', checked)}
                />
                <SwitchRow
                    label="Notification sound"
                    description="Play a sound for important updates when sound is available."
                    checked={preferences.playSound}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('playSound', checked)}
                />
            </Section>

            <Section title="Notify me about">
                <SwitchRow
                    label="Study run completed"
                    description="Let me know when a study run finishes."
                    checked={preferences.completionNotifications}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('completionNotifications', checked)}
                />
                <SwitchRow
                    label="Notes generation completed"
                    description="Let me know when generated notes are ready."
                    checked={preferences.completionNotifications}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('completionNotifications', checked)}
                />
                <SwitchRow
                    label="Login verification required"
                    description="Let me know when Pilot needs me to complete a login check."
                    checked={preferences.loginAlerts}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('loginAlerts', checked)}
                />
                <SwitchRow
                    label="Errors"
                    description="Let me know when Pilot cannot continue."
                    checked={preferences.errorNotifications}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('errorNotifications', checked)}
                />
            </Section>
        </div>
    );
}
