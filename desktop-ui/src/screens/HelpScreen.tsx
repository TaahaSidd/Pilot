import { BookOpen, CircleHelp, LifeBuoy, MessageSquareText } from 'lucide-react';

const helpItems = [
    {
        title: 'Getting started',
        description: 'Set up your profile, start a study run, and open generated notes from the dashboard.',
        icon: BookOpen,
    },
    {
        title: 'Study run help',
        description: 'Use the dashboard to follow your current course, topic, progress, and updates.',
        icon: LifeBuoy,
    },
    {
        title: 'Notes help',
        description: 'Generated notes are grouped by course, module, and note file with breadcrumb navigation.',
        icon: MessageSquareText,
    },
];

export function HelpScreen() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        letterSpacing: 0,
                        margin: '0 0 6px',
                        color: 'var(--text-primary)',
                    }}
                >
                    Help
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                    Quick reference for using Pilot as your Amity study assistant.
                </p>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                }}
            >
                {helpItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <section
                            key={item.title}
                            style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '7px',
                                    backgroundColor: 'var(--accent-soft)',
                                    color: 'var(--accent)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon size={18} />
                            </div>

                            <div>
                                <h2
                                    style={{
                                        color: 'var(--text-primary)',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        margin: '0 0 6px',
                                        letterSpacing: 0,
                                    }}
                                >
                                    {item.title}
                                </h2>
                                <p
                                    style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '13px',
                                        lineHeight: '20px',
                                        margin: 0,
                                    }}
                                >
                                    {item.description}
                                </p>
                            </div>
                        </section>
                    );
                })}
            </div>

            <section
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                }}
            >
                <CircleHelp size={20} color="var(--accent)" />
                <div>
                    <h2
                        style={{
                            color: 'var(--text-primary)',
                            fontSize: '15px',
                            fontWeight: 600,
                            margin: '0 0 6px',
                            letterSpacing: 0,
                        }}
                    >
                        Need more control?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '20px', margin: 0 }}>
                        Open Settings from the bottom of the sidebar to manage your profile, updates, appearance, and study preferences.
                    </p>
                </div>
            </section>
        </div>
    );
}
