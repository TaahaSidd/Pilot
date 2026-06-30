import React, { useState } from 'react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Toast } from '../components/shared/Toast';
import { useToast } from '../hooks/useToast';
import { InfoModal } from '../components/shared/InfoModal';
import { pilotApi, ApiError, NetworkError } from '../api/api';

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
            if (err instanceof NetworkError) showToast(err.message, 'error');
            else if (err instanceof ApiError) showToast(`Couldn't save: ${err.message}`, 'error');
            else showToast("Couldn't save your details.", 'error');
        } finally {
            setSaving(false);
        }
    };

    const validateAndNext = () => {
        if (step === 1 && data.groqApiKey.length < 1) return showToast('Please enter Groq API Key', 'error');
        if (step === 2 && (!data.email.includes('@') || data.password.length < 6)) return showToast('Valid Amity credentials required', 'error');
        if (step === 3 && data.phoneNumber.replace(/\D/g, '').length < 10) return showToast('Invalid phone number', 'error');
        if (step === 4 && data.name.length < 2) return showToast('Please enter your name', 'error');

        if (step < TOTAL_STEPS) setStep((prev) => prev + 1);
        else saveConfig();
    };

    const stepTitle = step === 1 ? 'Connect your AI' : step === 2 ? 'Link your Amity Account' : step === 3 ? 'A few more details' : 'Welcome aboard!';
    const stepSubtitle = step === 1 ? 'Enter your Groq API key.' : step === 2 ? 'Sync your study materials.' : step === 3 ? 'Auto-fill forms on your behalf.' : 'Final step to personalize.';

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}>
            {/* Left Side: Wizard Content */}
            <div style={{ flex: 1, display: 'flex', padding: '64px' }}>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                    {/* Centered Form Area */}
                    <div style={{ margin: 'auto 0' }}>
                        <div>
                            <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 700 }}>{stepTitle}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>{stepSubtitle}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
                            {step === 1 && <Input label="Groq API Key" type="password" value={data.groqApiKey} onChange={(e) => setData({ ...data, groqApiKey: e.target.value })} />}
                            {step === 2 && (
                                <>
                                    <Input label="Amity Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                    <Input label="Amity Password" type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                                </>
                            )}
                            {step === 3 && <Input label="Phone Number" value={data.phoneNumber} onChange={(e) => setData({ ...data, phoneNumber: e.target.value })} />}
                            {step === 4 && <Input label="What should we call you?" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                                <Button variant="primary" onClick={validateAndNext} disabled={saving} style={{ width: '100%' }}>
                                    {saving ? 'Saving…' : step === TOTAL_STEPS ? 'Get Started' : 'Continue'}
                                </Button>
                                <div style={{ textAlign: 'center' }}>
                                    {step === 1 && <span onClick={() => setModalType('groq')} style={{ color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Where do I find my API key?</span>}
                                    {step === 2 && <span onClick={() => setModalType('amity')} style={{ color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Why do you need my credentials?</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Pinned to Bottom */}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '20px' }}>
                        By continuing, you agree to our{' '}
                        <span onClick={() => setModalType('legal')} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
                        {' '}and{' '}
                        <span onClick={() => setModalType('legal')} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
                    </div>
                </div>
            </div>

            {/* Right Side: Hero Image */}
            <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.2), rgba(10, 10, 10, 0.2)), url('https://images.unsplash.com/photo-1779126931857-f12866cf7049?fm=jpg&q=60&w=3000&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '80px', borderLeft: '1px solid var(--border)' }}>
                <div style={{ color: '#FFF', textAlign: 'right', maxWidth: '650px', padding: '50px', borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: '1.2', margin: 0 }}>Let Pilot handle Amity.</h2>
                    <p style={{ fontSize: '18px', opacity: 0.8, marginTop: '24px', lineHeight: '1.6' }}>Pilot automates your Amigo portal tasks, solving validation checkpoints automatically.</p>
                </div>
            </div>

            <InfoModal isOpen={modalType === 'groq'} onClose={() => setModalType(null)} title="Finding your Groq API Key">
                1. Head over to <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>console.groq.com</a> and log in.<br /><br />
                2. Look for the <b>API Keys</b> tab in the sidebar.<br /><br />
                3. Create a new key, copy it, and paste it here!
            </InfoModal>
            <InfoModal isOpen={modalType === 'amity'} onClose={() => setModalType(null)} title="Privacy">
                We only use credentials for automation. Passwords are encrypted locally and never stored on our servers.
            </InfoModal>
            <InfoModal isOpen={modalType === 'legal'} onClose={() => setModalType(null)} title="Terms & Privacy">
                <p>Pilot is a local-first automation tool. Your data stays on your machine.</p>
                <p>By using Pilot, you acknowledge that you are responsible for any actions performed on your account.</p>
            </InfoModal>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}