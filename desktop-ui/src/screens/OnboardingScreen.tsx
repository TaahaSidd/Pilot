import React, { useState } from 'react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Toast } from '../components/shared/Toast';
import { useToast } from '../hooks/useToast';
import { InfoModal } from '../components/shared/InfoModal';

interface OnboardingScreenProps {
    onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ groqApiKey: '', email: '', password: '', name: '' });
    const [modalType, setModalType] = useState<'groq' | 'amity' | null>(null);
    const { toast, showToast, hideToast } = useToast();

    const validateAndNext = () => {
        if (step === 1 && data.groqApiKey.length < 1) {
            showToast('Please enter your Groq API Key to continue', 'error');
            return;
        }
        if (step === 2 && (!data.email.includes('@') || data.password.length < 6)) {
            showToast('Please enter a valid Amity email and password', 'error');
            return;
        }
        if (step === 3 && data.name.length < 2) {
            showToast('Please let us know how to address you', 'error');
            return;
        }

        if (step < 3) {
            setStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}>

            {/* Left Side: Wizard Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <div>
                        <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 700 }}>
                            {step === 1 ? 'Connect your AI' : step === 2 ? 'Link your Amity Account' : 'Welcome aboard!'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                            {step === 1 ? 'Enter your Groq API key to power your personal assistant.' :
                                step === 2 ? 'Sign in so we can securely sync your study materials.' :
                                    'Just a quick final step to personalize your experience.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {step === 1 && (
                            <Input label="Groq API Key" type="password" value={data.groqApiKey} onChange={(e) => setData({ ...data, groqApiKey: e.target.value })} />
                        )}
                        {step === 2 && (
                            <>
                                <Input label="Amity Email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                <Input label="Amity Password" type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                            </>
                        )}
                        {step === 3 && (
                            <Input label="What should we call you?" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                        )}

                        {/* Button and Helper Link Stack */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                            <Button variant="primary" onClick={validateAndNext} style={{ width: '100%' }}>
                                {step === 3 ? 'Get Started' : 'Continue'}
                            </Button>

                            {/* Conditional Helper Links */}
                            {step === 1 && (
                                <span onClick={() => setModalType('groq')} style={{ color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', fontWeight: 500 }}>
                                    Where do I find my API key?
                                </span>
                            )}
                            {step === 2 && (
                                <span onClick={() => setModalType('amity')} style={{ color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', fontWeight: 500 }}>
                                    Why do you need my credentials?
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Hero Image */}
            <div style={{
                flex: 1,
                backgroundColor: 'var(--bg-secondary)',
                backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.2), rgba(10, 10, 10, 0.2)), url('https://images.unsplash.com/photo-1780163930838-1502715c3bc1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: '80px',
                borderLeft: '1px solid var(--border)'
            }}>
                {/* Refined Glassmorphism Container */}
                <div style={{
                    color: '#FFF',
                    textAlign: 'right',
                    maxWidth: '650px',
                    padding: '50px', // Matching your profile-card padding
                    borderRadius: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' // Softer, less "dark" shadow
                }}>
                    <h2 style={{ fontSize: '42px', fontWeight: 700, lineHeight: '1.2', margin: 0 }}>
                        Let Pilot handle Amity.
                    </h2>
                    <p style={{ fontSize: '18px', opacity: 0.8, marginTop: '24px', lineHeight: '1.6' }}>
                        Pilot automates your Amigo portal tasks, solving validation checkpoints and clearing forms automatically.
                    </p>
                </div>
            </div>

            {/* Modals */}
            <InfoModal isOpen={modalType === 'groq'} onClose={() => setModalType(null)} title="Finding your Groq API Key">
                1. Head over to <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>console.groq.com</a> and log in.<br /><br />
                2. Look for the <b>API Keys</b> tab in the sidebar.<br /><br />
                3. Create a new key, copy it, and paste it here!
            </InfoModal>

            <InfoModal isOpen={modalType === 'amity'} onClose={() => setModalType(null)} title="Your privacy is our priority">
                We only use your credentials to securely automate your login and keep your workspace synced. Your password stays encrypted locally—we never store it on our servers.
            </InfoModal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}