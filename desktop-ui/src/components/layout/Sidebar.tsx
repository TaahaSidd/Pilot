import { useState } from 'react';
import {
    ClipboardList,
    BookOpenText,
    FileText,
    HelpCircle,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
    currentTab: string;
    setTab: (tab: string) => void;
}

type SidebarItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    href?: string;
};

const mainItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'sessions', label: 'History', icon: ClipboardList },
];

const bottomItems: SidebarItem[] = [
    { id: 'docs', label: 'Docs', icon: BookOpenText, href: 'https://pilotcli.netlify.app/docs' },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const CLI_DOCS_URL = 'https://pilotcli.netlify.app/docs';
const PILOT_LOGO_URL = '/PilotSVG.svg';

function Tooltip({ label }: { label: string }) {
    return (
        <div
            style={{
                position: 'absolute',
                left: '48px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'var(--surface-overlay)',
                color: 'var(--text-primary)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                zIndex: 20,
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)',
            }}
        >
            {label}
        </div>
    );
}

function SidebarButton({
    item,
    active,
    expanded,
    hovered,
    onHover,
    onSelect,
}: {
    item: SidebarItem;
    active: boolean;
    expanded: boolean;
    hovered: boolean;
    onHover: (id: string | null) => void;
    onSelect: () => void;
}) {
    const Icon = item.icon;

    return (
        <button
            type="button"
            onClick={onSelect}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            title={expanded ? undefined : item.label}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                gap: '13px',
                width: expanded ? '100%' : '40px',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid transparent',
                backgroundColor: active ? 'color-mix(in srgb, var(--accent) 12%, var(--surface))' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
                padding: expanded ? '0 12px' : 0,
                fontSize: '14px',
                fontWeight: active ? 700 : 500,
                letterSpacing: 0,
                textAlign: 'left',
            }}
        >
            <Icon size={18} style={{ flex: '0 0 auto' }} />

            {expanded && (
                <span
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item.label}
                </span>
            )}

            {!expanded && hovered && <Tooltip label={item.label} />}
        </button>
    );
}

export function Sidebar({ currentTab, setTab }: SidebarProps) {
    const [expanded, setExpanded] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen;

    const renderItem = (item: SidebarItem) => (
        <SidebarButton
            key={item.id}
            item={item}
            active={currentTab === item.id}
            expanded={expanded}
            hovered={hoveredId === item.id}
            onHover={setHoveredId}
            onSelect={() => {
                if (item.href) {
                    window.open(item.href, '_blank', 'noopener,noreferrer');
                    return;
                }

                setTab(item.id);
            }}
        />
    );

    return (
        <aside
            style={{
                width: expanded ? '264px' : '56px',
                backgroundColor: 'color-mix(in srgb, var(--surface) 88%, var(--background))',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: expanded ? '18px 14px' : '12px 8px',
                height: '100vh',
                transition: 'width 180ms ease, padding 180ms ease',
                flex: '0 0 auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: expanded ? 'space-between' : 'center',
                    height: '48px',
                    marginBottom: '28px',
                    gap: '14px',
                }}
            >
                {expanded ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 0,
                            height: '48px',
                        }}
                    >
                        <img
                            src={PILOT_LOGO_URL}
                            alt="Pilot"
                            style={{
                                width: '96px',
                                height: '34px',
                                objectFit: 'contain',
                                display: 'block',
                            }}
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        title="Expand sidebar"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface-subtle)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 160ms ease, color 160ms ease',
                        }}
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {expanded && (
                    <button
                        type="button"
                        onClick={() => setExpanded((value) => !value)}
                        title="Collapse sidebar"
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface-subtle)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 160ms ease, color 160ms ease',
                        }}
                    >
                        <ToggleIcon size={18} />
                    </button>
                )}
            </div>

            {expanded && (
                <>
                    <nav
                        aria-label="Primary"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'stretch',
                        }}
                    >
                        {mainItems.map(renderItem)}
                    </nav>

                    <nav
                        aria-label="Support"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'stretch',
                            marginTop: 'auto',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => window.open(CLI_DOCS_URL, '_blank', 'noopener,noreferrer')}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid color-mix(in srgb, var(--accent) 26%, rgba(255, 255, 255, 0.24))',
                                borderRadius: '12px',
                                padding: '14px',
                                marginBottom: '12px',
                                minHeight: '92px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#F8F7FC',
                                background:
                                    'linear-gradient(135deg, #8800CC 0%, #AA00FF 42%, #0F766E 100%)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0.18,
                                    background:
                                        'radial-gradient(circle at 18% 20%, #FFFFFF 0 1px, transparent 2px), radial-gradient(circle at 72% 34%, #FFFFFF 0 1px, transparent 2px)',
                                    backgroundSize: '28px 28px',
                                }}
                            />
                            <div style={{ position: 'relative' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: '18px', letterSpacing: 0 }}>
                                        Try our CLI
                                    </div>
                                    <div style={{ fontSize: '12px', lineHeight: '16px', opacity: 0.82, marginTop: '3px' }}>
                                        Run Pilot from your terminal when you want full control.
                                    </div>
                                </div>
                            </div>
                        </button>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                paddingTop: '14px',
                                borderTop: '1px solid var(--border)',
                            }}
                        >
                            {bottomItems.map(renderItem)}
                        </div>
                    </nav>
                </>
            )}
        </aside>
    );
}
