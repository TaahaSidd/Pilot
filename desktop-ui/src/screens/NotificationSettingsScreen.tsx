import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Card, PageHeader } from '../components/ui';
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
                gap: 'var(--space-5)',
                padding: 'var(--space-3) 0',
                borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.54 : 1,
            }}
        >
            <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 'var(--type-body-size)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: 0 }}>
                    {label}
                </span>
                <span style={{ display: 'block', fontSize: 'var(--type-body-small-size)', color: 'var(--text-muted)', marginTop: 'var(--space-1)', lineHeight: 'var(--type-body-small-line)' }}>
                    {description}
                </span>
            </span>

            <span
                style={{
                    width: '42px',
                    height: '24px',
                    borderRadius: 'var(--radius-pill)',
                    padding: '3px',
                    backgroundColor: checked ? 'var(--accent)' : 'var(--surface-subtle)',
                    border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'background-color var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard)',
                    flex: '0 0 auto',
                }}
            >
                <span
                    style={{
                        display: 'block',
                        width: '16px',
                        height: '16px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--text-on-accent)',
                        transform: checked ? 'translateX(18px)' : 'translateX(0)',
                        transition: 'transform var(--motion-base) var(--ease-emphasized)',
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
        <section style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <h2 className="pilot-type-section-title" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {title}
            </h2>
            <Card padding="sm" style={{ padding: '0 var(--space-4)' }}>
                {children}
            </Card>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 'var(--layout-readable)', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                    Back to Settings
                </Button>
            </div>

            <PageHeader
                title="Notifications"
                description="Choose which Pilot updates you want to see."
            />

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
                    description="Show important Pilot updates as Windows notifications."
                    checked={preferences.nativeNotifications}
                    disabled={!enabled}
                    onChange={(checked) => setPreference('nativeNotifications', checked)}
                />
                <SwitchRow
                    label="Notification sound"
                    description="Play a soft sound for important updates."
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
