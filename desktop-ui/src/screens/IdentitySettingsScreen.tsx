import { useEffect, useState } from 'react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/shared/Toast';
import { pilotApi, ApiError, NetworkError } from '../api/api';

interface IdentitySettingsScreenProps {
    onBack: () => void;
}

// Fixed placeholder shown for secret fields we never receive from the
// backend (GET /config deliberately omits groq_api_key and password).
// This is NOT real data — it's a constant signal meaning "something
// is saved." The moment the user types here, the field becomes
// "touched" and the placeholder is replaced by their real input.
const MASKED_PLACEHOLDER = '••••••••••••';

export function IdentitySettingsScreen({ onBack }: IdentitySettingsScreenProps) {
    const { toast, showToast, hideToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // non-secret fields — prefilled with REAL values from GET /config
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // secret fields — start at the masked placeholder. "touched"
    // tracks whether the user has actually typed something new;
    // only touched fields get sent on save.
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
        // clear the placeholder on first focus so the user types into
        // an empty field rather than appending to dots
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

            // only send secrets the user actually changed — an
            // untouched field means "leave this as-is" server-side
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

            showToast('Your security credentials have been updated.', 'success');

            // reset secret fields back to masked state — they're saved
            // now, so there's no reason to keep showing raw input
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
            <div style={{ padding: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Loading your settings…
            </div>
        );
    }

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                Back to Settings
            </Button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Intelligence Section */}
                <section style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Intelligence</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Manage your LLM access keys. These are stored locally and used for agent orchestration.
                    </p>
                    <Input
                        label="Groq API Key"
                        description="Leave as-is to keep your current key, or click in to replace it."
                        type="password"
                        value={groqApiKey}
                        onFocus={handleGroqFocus}
                        onChange={(e) => handleGroqChange(e.target.value)}
                    />
                </section>

                {/* Credentials Section */}
                <section style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Amity Credentials</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        These details authorize your automated browser sessions with the campus portal.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input
                            label="Institutional Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            label="Portal Password"
                            description="Leave as-is to keep your current password, or click in to replace it."
                            type="password"
                            value={password}
                            onFocus={handlePasswordFocus}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                        />
                        <Input
                            label="Display Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                        <Input
                            label="Phone Number"
                            description="Used to auto-fill feedback forms on the portal."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                </section>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <Button variant="ghost" onClick={onBack} disabled={saving}>Cancel</Button>
                <Button variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                </Button>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </div>
    );
}
