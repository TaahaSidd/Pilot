import React from 'react';
import { useTheme } from '../context/ThemeContext';

export function ThemeSettingsScreen({ onBack }: { onBack: () => void }) {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', label: 'Light', bg: '#F8F9FA', text: '#1F1F1F' },
        { id: 'dark', label: 'Dark', bg: '#0A0A0A', text: '#FFFFFF' },
        { id: 'system', label: 'System', bg: 'linear-gradient(135deg, #F8F9FA 50%, #0A0A0A 50%)', text: 'var(--text-primary)' },
        { id: 'high-contrast', label: 'Contrast', bg: '#000000', text: '#FFD700' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'var(--social-bg)', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500 }}
                >
                    ← Back
                </button>
                <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary)' }}>Appearance</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {themes.map((t) => {
                    const isComingSoon = t.id === 'system' || t.id === 'high-contrast';
                    const isActive = theme === t.id;

                    return (
                        <div
                            key={t.id}
                            onClick={() => !isComingSoon && setTheme(t.id as 'light' | 'dark')}
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: '12px',
                                padding: '20px',
                                // Active border is now much thicker/clearer
                                border: isActive ? '3px solid var(--primary)' : '2px solid var(--border)',
                                cursor: isComingSoon ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isComingSoon ? 0.5 : 1,
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                background: t.bg,
                                height: '80px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: t.text,
                                fontWeight: 'bold'
                            }}>
                                {t.id === 'system' ? 'A/B' : 'Aa'}
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                                {t.label} {isActive && '(Active)'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {isComingSoon ? 'Coming Soon' : 'Click to apply'}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}