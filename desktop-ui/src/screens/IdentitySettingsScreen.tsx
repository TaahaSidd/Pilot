import React, { useState } from 'react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { ArrowLeft, Save } from 'lucide-react';
// Import the hook and the component
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/shared/Toast';

interface IdentitySettingsScreenProps {
    onBack: () => void;
}

export function IdentitySettingsScreen({ onBack }: IdentitySettingsScreenProps) {
    const { toast, showToast, hideToast } = useToast();
    const [profile, setProfile] = useState({
        groqApiKey: 'gsk_yK89...vX41n',
        email: 'alex.chen@enterprise.ai',
        password: 'password123'
    });

    const handleSave = () => {
        showToast('Your security credentials have been updated.', 'success');
    };

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
                        description="Ensure your key has the necessary permissions for your current workflow."
                        type="password"
                        value={profile.groqApiKey}
                        onChange={(e) => setProfile({ ...profile, groqApiKey: e.target.value })}
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
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                        <Input
                            label="Portal Password"
                            type="password"
                            value={profile.password}
                            onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                        />
                    </div>
                </section>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <Button variant="ghost" onClick={onBack}>Cancel</Button>
                <Button variant="primary" icon={Save} onClick={handleSave}>Save Changes</Button>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </div>
    );
}