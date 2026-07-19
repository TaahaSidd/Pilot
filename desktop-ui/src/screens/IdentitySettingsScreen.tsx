import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Card, Input, PageHeader, Skeleton } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/shared/Toast';
import { pilotApi, ApiError, NetworkError } from '../api/api';

interface IdentitySettingsScreenProps {
    onBack: () => void;
}

// Fixed placeholder shown for secret fields we never receive from the backend.
// This is not real data. It only means something is already saved.
const MASKED_PLACEHOLDER = '************';

export function IdentitySettingsScreen({ onBack }: IdentitySettingsScreenProps) {
    const { toast, showToast, hideToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [groqApiKey, setGroqApiKey] = useState(MASKED_PLACEHOLDER);
    const [groqTouched, setGroqTouched] = useState(false);

    const [password, setPassword] = useState(MASKED_PLACEHOLDER);
    const [passwordTouched, setPasswordTouched] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const cfg = await pilotApi.getConfig();
                if (cancelled) return;

                if (cfg.configured) {
                    setUsername(cfg.username ?? '');
                    setDisplayName(cfg.display_name ?? '');
                    setPhoneNumber(cfg.phone_number ?? '');
                }
            } catch (err) {
                if (cancelled) return;
                showToast(
                    err instanceof NetworkError
                        ? err.message
                        : "Couldn't load your current settings.",
                    'error'
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGroqChange = (value: string) => {
        setGroqTouched(true);
        setGroqApiKey(value);
    };

    const handleGroqFocus = () => {
        if (!groqTouched && groqApiKey === MASKED_PLACEHOLDER) {
            setGroqApiKey('');
        }
    };

    const handlePasswordChange = (value: string) => {
        setPasswordTouched(true);
        setPassword(value);
    };

    const handlePasswordFocus = () => {
        if (!passwordTouched && password === MASKED_PLACEHOLDER) {
            setPassword('');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: Parameters<typeof pilotApi.updateConfig>[0] = {
                username,
                display_name: displayName,
                phone_number: phoneNumber,
            };

            if (groqTouched && groqApiKey.trim().length > 0) {
                payload.groq_api_key = groqApiKey;
            }
            if (passwordTouched && password.trim().length > 0) {
                payload.password = password;
            }

            const result = await pilotApi.updateConfig(payload);
            if (!result.saved) {
                throw new Error('Server did not confirm the save.');
            }

            showToast('Your profile and keys have been updated.', 'success');

            setGroqApiKey(MASKED_PLACEHOLDER);
            setGroqTouched(false);
            setPassword(MASKED_PLACEHOLDER);
            setPasswordTouched(false);
        } catch (err) {
            if (err instanceof NetworkError) {
                showToast(err.message, 'error');
            } else if (err instanceof ApiError) {
                showToast(`Couldn't save changes: ${err.message}`, 'error');
            } else {
                showToast("Couldn't save changes. Please try again.", 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 'var(--layout-readable)', margin: '0 auto', width: '100%', display: 'grid', gap: 'var(--space-3)' }}>
                <Skeleton height="24px" width="220px" />
                <Skeleton height="18px" width="84%" />
                <Skeleton height="160px" />
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: 'var(--layout-readable)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                Back to Settings
            </Button>

            <PageHeader
                title="Profile and API keys"
                description="Update your name, Amity login details, or your Groq API key."
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <Card style={{ display: 'grid', gap: 'var(--space-5)' }}>
                    <div>
                        <h2 className="pilot-type-section-title" style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>
                            Intelligence
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Manage the API key Pilot uses to generate notes.
                        </p>
                    </div>
                    <Input
                        label="Groq API key"
                        helperText="Leave as-is to keep your current key, or click in to replace it."
                        type="password"
                        value={groqApiKey}
                        onFocus={handleGroqFocus}
                        onChange={(event) => handleGroqChange(event.target.value)}
                    />
                </Card>

                <Card style={{ display: 'grid', gap: 'var(--space-5)' }}>
                    <div>
                        <h2 className="pilot-type-section-title" style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>
                            Amity login
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Pilot uses these details to open your Amity study material.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <Input
                            label="Amity username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />
                        <Input
                            label="Password"
                            helperText="Leave as-is to keep your current password, or click in to replace it."
                            type="password"
                            value={password}
                            onFocus={handlePasswordFocus}
                            onChange={(event) => handlePasswordChange(event.target.value)}
                        />
                        <Input
                            label="Display name"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                        />
                        <Input
                            label="Phone number"
                            helperText="Used to fill forms on the portal when needed."
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                        />
                    </div>
                </Card>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
                <Button variant="ghost" onClick={onBack} disabled={saving}>Cancel</Button>
                <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </div>
    );
}
