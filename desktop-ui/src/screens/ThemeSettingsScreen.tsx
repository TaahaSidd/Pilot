import { ArrowLeft, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button, PageHeader } from '../components/ui';

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
        description: 'Low glare interface for longer study sessions.',
        previewBackground: '#101014',
        previewSurface: '#1B1B21',
        previewAccent: '#AA00FF',
    },
    {
        id: 'light',
        label: 'Light',
        description: 'Brighter interface for daytime work.',
        previewBackground: '#F7F8FB',
        previewSurface: '#FCFCFD',
        previewAccent: '#AA00FF',
    },
    {
        id: 'system',
        label: 'System',
        description: 'Follow your operating system appearance.',
        previewBackground: 'linear-gradient(135deg, #F7F8FB 0 50%, #101014 50% 100%)',
        previewSurface: '#FCFCFD',
        previewAccent: '#AA00FF',
    },
];

export function ThemeSettingsScreen({ onBack }: { onBack: () => void }) {
    const { theme, setTheme } = useTheme();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: 'var(--layout-readable)', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                    Back
                </Button>
            </div>

            <PageHeader title="Appearance" description="Choose how Pilot looks on this device." />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                {themes.map((item) => {
                    const isActive = theme === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setTheme(item.id)}
                            style={{
                                background: 'var(--surface-card)',
                                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-5)',
                                border: isActive ? 'var(--stroke-medium) solid var(--accent)' : 'var(--stroke-thin) solid var(--border-subtle)',
                                cursor: 'pointer',
                                transition: 'border-color var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)',
                                textAlign: 'left',
                                color: 'inherit',
                            }}
                        >
                            <div
                                style={{
                                    height: '92px',
                                    borderRadius: 'var(--radius-control)',
                                    marginBottom: 'var(--space-4)',
                                    border: 'var(--stroke-thin) solid var(--border-subtle)',
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
                                        gap: 'var(--space-3)',
                                    }}
                                >
                                    <span style={{ width: '44px', height: '28px', borderRadius: 'var(--radius-control)', background: item.previewSurface, border: '1px solid rgba(0, 0, 0, 0.08)' }} />
                                    <span style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-pill)', background: item.previewAccent }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <h3 className="pilot-type-subsection-title" style={{ margin: 0, color: 'var(--text-primary)' }}>
                                    {item.label}
                                </h3>

                                {isActive && <Check size={16} color="var(--accent)" />}
                            </div>

                            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--type-body-small-size)', lineHeight: 'var(--type-body-small-line)', color: 'var(--text-secondary)' }}>
                                {item.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
