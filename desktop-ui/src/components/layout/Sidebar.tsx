import { useState } from 'react';
import {
    ClipboardList,
    FileText,
    HelpCircle,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    Zap,
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
};

const mainItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'logs', label: 'Activity archive', icon: ClipboardList },
    { id: 'notes', label: 'Notes', icon: FileText },
];

const bottomItems: SidebarItem[] = [
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
];

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
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
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
                gap: '12px',
                width: expanded ? '100%' : '36px',
                height: '36px',
                borderRadius: '6px',
                border: '1px solid transparent',
                backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
                padding: expanded ? '0 10px' : 0,
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
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
    const [expanded, setExpanded] = useState(false);
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
            onSelect={() => setTab(item.id)}
        />
    );

    return (
        <aside
            style={{
                width: expanded ? '224px' : '40px',
                backgroundColor: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: expanded ? '12px' : '8px 4px',
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
                    height: '36px',
                    marginBottom: '18px',
                    gap: '10px',
                }}
            >
                {expanded && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: 0,
                        }}
                    >
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '7px',
                                backgroundColor: 'var(--accent)',
                                color: 'var(--text-on-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: '0 0 auto',
                            }}
                        >
                            <Zap size={15} />
                        </div>
                        <span
                            style={{
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                fontWeight: 700,
                                letterSpacing: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Pilot
                        </span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: 'transparent',
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
            </div>

            {expanded && (
                <>
                    <nav
                        aria-label="Primary"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
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
                            gap: '6px',
                            alignItems: 'stretch',
                            marginTop: 'auto',
                            paddingTop: '12px',
                            borderTop: '1px solid var(--border)',
                        }}
                    >
                        {bottomItems.map(renderItem)}
                    </nav>
                </>
            )}
        </aside>
    );
}
