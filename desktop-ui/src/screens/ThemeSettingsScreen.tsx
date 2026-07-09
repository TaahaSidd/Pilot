import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/shared/Button';

type ThemeOption = {
    id: 'light' | 'dark' | 'system';
    label: string;
    description: string;
    previewBackground: string;
    previewSurface: string;
    previewAccent: string;
};

const themes: ThemeOption[] = [
    {
        id: 'dark',
        label: 'Dark',
        description: 'Low glare interface for long automation runs.',
        previewBackground: '#101014',
        previewSurface: '#1B1B21',
        previewAccent: '#7C3AED',
    },
    {
        id: 'light',
        label: 'Light',
        description: 'Brighter interface for daytime work.',
        previewBackground: '#F7F8FB',
        previewSurface: '#FCFCFD',
        previewAccent: '#7C3AED',
    },
    {
        id: 'system',
        label: 'System',
        description: 'Follow your operating system appearance.',
        previewBackground: 'linear-gradient(135deg, #F7F8FB 0 50%, #101014 50% 100%)',
        previewSurface: '#FCFCFD',
        previewAccent: '#7C3AED',
    },
];

export function ThemeSettingsScreen({ onBack }: { onBack: () => void }) {
    const { theme, setTheme } = useTheme();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                    Back
                </Button>

                <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary)' }}>
                    Appearance
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {themes.map((item) => {
                    const isActive = theme === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setTheme(item.id)}
                            style={{
                                background: 'var(--surface)',
                                borderRadius: '12px',
                                padding: '18px',
                                border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'border-color 150ms ease, background-color 150ms ease',
                                textAlign: 'left',
                                color: 'inherit',
                            }}
                        >
                            <div
                                style={{
                                    height: '92px',
                                    borderRadius: '10px',
                                    marginBottom: '16px',
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                <div
                                    style={{
                                        background: item.previewBackground,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <span style={{ width: '44px', height: '28px', borderRadius: '7px', background: item.previewSurface, border: '1px solid rgba(0, 0, 0, 0.08)' }} />
                                    <span style={{ width: '28px', height: '28px', borderRadius: '999px', background: item.previewAccent }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
                                    {item.label}
                                </h3>

                                {isActive && <Check size={16} color="var(--accent)" />}
                            </div>

                            <p style={{ margin: '8px 0 0', fontSize: '12px', lineHeight: '18px', color: 'var(--text-secondary)' }}>
                                {item.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
