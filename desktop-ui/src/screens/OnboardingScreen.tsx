import { useState } from 'react';
import { Button, Input } from '../components/ui';
import { Toast } from '../components/shared/Toast';
import { useToast } from '../hooks/useToast';
import { InfoModal } from '../components/shared/InfoModal';
import { pilotApi } from '../api/api';
import { formatUnknownError } from '../utils/userFacingError';
import heroImage from '../assets/hero.png';

interface OnboardingScreenProps {
    onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        groqApiKey: '',
        email: '',
        password: '',
        phoneNumber: '',
        name: '',
    });
    const [modalType, setModalType] = useState<'groq' | 'amity' | 'legal' | null>(null);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const TOTAL_STEPS = 4;

    const saveConfig = async () => {
        setSaving(true);
        try {
            const result = await pilotApi.setConfig({
                groq_api_key: data.groqApiKey,
                username: data.email,
                password: data.password,
                phone_number: data.phoneNumber,
                display_name: data.name,
            });
            if (!result.saved) throw new Error('Server did not confirm the save.');
            onComplete();
        } catch (err) {
            showToast(formatUnknownError(err, "Couldn't save your details. Please try again."), 'error');
        } finally {
            setSaving(false);
        }
    };

    const validateAndNext = () => {
        if (step === 1 && data.groqApiKey.length < 1) return showToast('Please enter your Groq API key.', 'error');
        if (step === 2 && (!data.email.includes('@') || data.password.length < 6)) return showToast('Valid Amity credentials required', 'error');
        if (step === 3 && data.phoneNumber.replace(/\D/g, '').length < 10) return showToast('Invalid phone number', 'error');
        if (step === 4 && data.name.length < 2) return showToast('Please enter your name', 'error');

        if (step < TOTAL_STEPS) setStep((prev) => prev + 1);
        else saveConfig();
    };

    const stepTitle = step === 1 ? 'Connect your AI' : step === 2 ? 'Link your Amity account' : step === 3 ? 'A few more details' : 'Welcome aboard!';
    const stepSubtitle = step === 1 ? 'Enter your Groq API key.' : step === 2 ? 'Sync your study materials.' : step === 3 ? 'Auto-fill forms on your behalf.' : 'Final step to personalize.';

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', minHeight: 0, backgroundColor: 'var(--background)', overflow: 'hidden' }}>
            <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', padding: 'clamp(28px, 5vw, var(--space-10))', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '400px', minHeight: 'min-content', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-8)' }}>
                    <div>
                        <div>
                            <h1 className="pilot-type-page-title" style={{ color: 'var(--text-primary)', margin: 0 }}>{stepTitle}</h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', marginBottom: 0 }}>{stepSubtitle}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
                            {step === 1 && <Input label="Groq API key" type="password" value={data.groqApiKey} onChange={(e) => setData({ ...data, groqApiKey: e.target.value })} />}
                            {step === 2 && (
                                <>
                                    <Input label="Amity email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                    <Input label="Amity password" type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                                </>
                            )}
                            {step === 3 && <Input label="Phone number" value={data.phoneNumber} onChange={(e) => setData({ ...data, phoneNumber: e.target.value })} />}
                            {step === 4 && <Input label="What should we call you?" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                                <Button variant="primary" onClick={validateAndNext} disabled={saving} style={{ width: '100%' }}>
                                    {saving ? 'Saving...' : step === TOTAL_STEPS ? 'Get started' : 'Continue'}
                                </Button>
                                <div style={{ textAlign: 'center' }}>
                                    {step === 1 && <span onClick={() => setModalType('groq')} style={{ color: 'var(--accent)', fontSize: 'var(--type-body-small-size)', cursor: 'pointer', textDecoration: 'underline' }}>Where do I find my API key?</span>}
                                    {step === 2 && <span onClick={() => setModalType('amity')} style={{ color: 'var(--accent)', fontSize: 'var(--type-body-small-size)', cursor: 'pointer', textDecoration: 'underline' }}>Why do you need my credentials?</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: 'var(--type-caption-size)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        By continuing, you agree to our{' '}
                        <span onClick={() => setModalType('legal')} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
                        {' '}and{' '}
                        <span onClick={() => setModalType('legal')} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
                    </div>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0,
                    backgroundColor: 'var(--surface-subtle)',
                    backgroundImage: `linear-gradient(color-mix(in srgb, var(--background) 18%, transparent), color-mix(in srgb, var(--background) 18%, transparent)), url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: 'clamp(24px, 4vw, var(--space-10))',
                    borderLeft: 'var(--stroke-thin) solid var(--border-subtle)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        color: 'var(--text-on-accent)',
                        textAlign: 'right',
                        maxWidth: 'min(650px, 80%)',
                        padding: 'clamp(24px, 4vw, var(--space-8))',
                        borderRadius: 'var(--radius-panel)',
                        backgroundColor: 'color-mix(in srgb, var(--surface) 24%, transparent)',
                        backdropFilter: 'blur(15px)',
                        border: 'var(--stroke-thin) solid color-mix(in srgb, var(--border) 70%, transparent)',
                        boxShadow: 'var(--shadow-lg)',
                    }}
                >
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, lineHeight: '1.2', margin: 0 }}>Your Amity study assistant.</h2>
                    <p style={{ fontSize: 'clamp(17px, 2vw, var(--type-section-title-size))', opacity: 0.84, marginTop: 'var(--space-5)', marginBottom: 0, lineHeight: '1.55' }}>Pilot helps you study, generate notes, and keep track of coursework from your Amity portal.</p>
                </div>
            </div>

            <InfoModal isOpen={modalType === 'groq'} onClose={() => setModalType(null)} title="Finding your Groq API Key">
                1. Head over to <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>console.groq.com</a> and log in.<br /><br />
                2. Look for the <b>API Keys</b> tab in the sidebar.<br /><br />
                3. Create a new key, copy it, and paste it here!
            </InfoModal>
            <InfoModal isOpen={modalType === 'amity'} onClose={() => setModalType(null)} title="Privacy">
                We only use credentials to help with your Amity study runs. Passwords are encrypted locally and never stored on our servers.
            </InfoModal>
            <InfoModal isOpen={modalType === 'legal'} onClose={() => setModalType(null)} title="Terms & Privacy">
                <p>Pilot is a local-first study assistant. Your data stays on your machine.</p>
                <p>By using Pilot, you acknowledge that you are responsible for any actions performed on your account.</p>
            </InfoModal>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}
