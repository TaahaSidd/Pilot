import { useState } from 'react';
import {
    ClipboardList,
    BookOpenText,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Settings,
    type LucideIcon,
} from 'lucide-react';
import { openExternalUrl } from '../../utils/openExternal';

interface SidebarProps {
    currentTab: string;
    setTab: (tab: string) => void;
    expanded: boolean;
    onClose?: () => void;
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
                borderRadius: 'var(--radius-control)',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                zIndex: 20,
                boxShadow: 'var(--shadow-dialog)',
                border: 'var(--stroke-thin) solid var(--border)',
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
            className="pilot-sidebar-button"
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
                gap: 'var(--space-3)',
                width: expanded ? '100%' : '40px',
                height: '42px',
                borderRadius: 'var(--radius-control)',
                border: active ? 'var(--stroke-thin) solid var(--border-subtle)' : 'var(--stroke-thin) solid transparent',
                backgroundColor: active ? 'var(--surface-selected)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background-color var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard), border-color var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)',
                padding: expanded ? '0 var(--space-3)' : 0,
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

export function Sidebar({ currentTab, setTab, expanded, onClose }: SidebarProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

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
                    void openExternalUrl(item.href);
                    return;
                }

                setTab(item.id);
                onClose?.();
            }}
        />
    );

    return (
        <aside
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 'var(--z-sidebar)',
                width: '264px',
                backgroundColor: 'var(--surface)',
                borderRight: 'var(--stroke-thin) solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-5) var(--space-4) var(--space-4)',
                height: '100%',
                transform: expanded ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform var(--motion-slow) var(--ease-emphasized), box-shadow var(--motion-slow) var(--ease-standard)',
                overflowX: 'hidden',
                overflowY: 'auto',
                pointerEvents: expanded ? 'auto' : 'none',
                boxShadow: expanded ? 'var(--shadow-lg)' : 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    height: '44px',
                    marginBottom: 'var(--space-6)',
                    gap: 'var(--space-4)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 0,
                        height: '44px',
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
            </div>

            {expanded && (
                <>
                    <nav
                        aria-label="Primary"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-2)',
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
                            gap: 'var(--space-2)',
                            alignItems: 'stretch',
                            marginTop: 'auto',
                        }}
                    >
                        <button
                            className="pilot-sidebar-promo"
                            type="button"
                            onClick={() => void openExternalUrl(CLI_DOCS_URL)}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                border: 'var(--stroke-thin) solid color-mix(in srgb, var(--accent) 26%, rgba(255, 255, 255, 0.24))',
                                borderRadius: 'var(--radius-card)',
                                padding: 'var(--space-4)',
                                marginBottom: 'var(--space-3)',
                                minHeight: '78px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: 'var(--color-brand-50)',
                                background:
                                    'linear-gradient(135deg, var(--color-brand-600) 0%, var(--accent) 42%, var(--success) 100%)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0.18,
                                    background:
                                        'radial-gradient(circle at 18% 20%, var(--color-brand-50) 0 1px, transparent 2px), radial-gradient(circle at 72% 34%, var(--color-brand-50) 0 1px, transparent 2px)',
                                    backgroundSize: '28px 28px',
                                }}
                            />
                            <div style={{ position: 'relative' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: '18px', letterSpacing: 0 }}>
                                        Try our CLI
                                    </div>
                                    <div style={{ fontSize: '12px', lineHeight: '15px', opacity: 0.82, marginTop: '3px' }}>
                                        Run Pilot from your terminal when you want full control.
                                    </div>
                                </div>
                            </div>
                        </button>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-2)',
                                paddingTop: 'var(--space-3)',
                                borderTop: 'var(--stroke-thin) solid var(--border-subtle)',
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
