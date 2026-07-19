import {
    ArrowLeft,
    ArrowRight,
    Bell,
    HelpCircle,
    Minus,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Square,
    Sun,
    UserRound,
    X,
} from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import { usePilotContext } from '../../context/usePilotContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return 'P';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

async function getTauriWindow() {
    try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        return getCurrentWindow();
    } catch {
        return null;
    }
}

function titleBarButtonStyle(active = false, disabled = false): CSSProperties {
    return {
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-control)',
        border: 'var(--stroke-thin) solid transparent',
        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
        color: disabled ? 'var(--text-muted)' : active ? 'var(--accent)' : 'var(--text-secondary)',
        display: 'grid',
        placeItems: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.44 : 1,
        transition: 'background-color var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard), opacity var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)',
    };
}

function windowButtonStyle(kind?: 'close'): CSSProperties {
    return {
        width: '42px',
        height: '34px',
        border: 0,
        borderRadius: 'var(--radius-control)',
        backgroundColor: 'transparent',
        color: kind === 'close' ? 'var(--error)' : 'var(--text-secondary)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        transition: 'background-color var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)',
    };
}

interface TitleBarProps {
    currentTab: string;
    setTab: (tab: string) => void;
    openProfileSettings?: () => void;
    canNavigateBack?: boolean;
    canNavigateForward?: boolean;
    onNavigateBack?: () => void;
    onNavigateForward?: () => void;
    sidebarExpanded?: boolean;
    onToggleSidebar?: () => void;
}

export function TitleBar({
    currentTab,
    setTab,
    openProfileSettings,
    canNavigateBack = false,
    canNavigateForward = false,
    onNavigateBack,
    onNavigateForward,
    sidebarExpanded = true,
    onToggleSidebar,
}: TitleBarProps) {
    const { config } = usePilotContext();
    const { unreadCount } = useNotifications();
    const { theme, setTheme } = useTheme();
    const userName = config?.display_name || config?.username || 'Pilot user';
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const ThemeIcon = theme === 'dark' ? Moon : Sun;

    const minimizeWindow = async () => {
        const appWindow = await getTauriWindow();
        await appWindow?.minimize();
    };

    const toggleMaximizeWindow = async () => {
        const appWindow = await getTauriWindow();
        await appWindow?.toggleMaximize();
    };

    const closeWindow = async () => {
        const appWindow = await getTauriWindow();
        await appWindow?.close();
    };

    const handleTitleBarDoubleClick = async () => {
        const appWindow = await getTauriWindow();
        await appWindow?.toggleMaximize();
    };

    const startDragging = async (event: MouseEvent<HTMLElement>) => {
        if (event.button !== 0) return;

        const appWindow = await getTauriWindow();
        await appWindow?.startDragging();
    };

    return (
        <header
            className="pilot-titlebar"
            style={{
                height: '48px',
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-2) 0 var(--space-4)',
                backgroundColor: 'var(--surface)',
                borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    minWidth: 0,
                }}
            >
                <button
                    className="pilot-titlebar-button"
                    data-tour-id="sidebar-toggle"
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    style={titleBarButtonStyle(false, !onToggleSidebar)}
                    disabled={!onToggleSidebar}
                >
                    {sidebarExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </button>

                <button
                    className="pilot-titlebar-button"
                    data-tour-id="help-button"
                    type="button"
                    onClick={onNavigateBack}
                    aria-label="Back"
                    title="Back"
                    disabled={!canNavigateBack}
                    style={titleBarButtonStyle(false, !canNavigateBack)}
                >
                    <ArrowLeft size={16} />
                </button>

                <button
                    className="pilot-titlebar-button"
                    type="button"
                    onClick={onNavigateForward}
                    aria-label="Forward"
                    title="Forward"
                    disabled={!canNavigateForward}
                    style={titleBarButtonStyle(false, !canNavigateForward)}
                >
                    <ArrowRight size={16} />
                </button>
            </div>

            <div
                onMouseDown={startDragging}
                onDoubleClick={handleTitleBarDoubleClick}
                aria-hidden="true"
                style={{
                    flex: 1,
                    height: '100%',
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <button
                    className="pilot-titlebar-button"
                    type="button"
                    onClick={() => setTheme(nextTheme)}
                    aria-label={`Switch to ${nextTheme} theme`}
                    title={`Switch to ${nextTheme} theme`}
                    style={titleBarButtonStyle()}
                >
                    <ThemeIcon size={16} />
                </button>

                <button
                    className="pilot-titlebar-button"
                    type="button"
                    onClick={() => setTab('help')}
                    aria-label="Help"
                    title="Help"
                    style={titleBarButtonStyle(currentTab === 'help')}
                >
                    <HelpCircle size={16} />
                </button>

                <button
                    className="pilot-titlebar-button"
                    data-tour-id="updates-button"
                    type="button"
                    onClick={() => setTab('notifications')}
                    aria-label="Updates"
                    title="Updates"
                    style={{
                        ...titleBarButtonStyle(currentTab === 'notifications'),
                        position: 'relative',
                    }}
                >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                        <span
                            className="pilot-unread-badge"
                            style={{
                                position: 'absolute',
                                top: '-3px',
                                right: '-2px',
                                minWidth: '16px',
                                height: '16px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: 'var(--error)',
                                color: 'var(--text-on-accent)',
                                fontSize: '10px',
                                fontWeight: 800,
                                lineHeight: '16px',
                                padding: '0 4px',
                                border: 'var(--stroke-focus) solid var(--surface)',
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                <button
                    className="pilot-titlebar-button"
                    type="button"
                    onClick={openProfileSettings}
                    aria-label="Profile and API keys"
                    title={userName}
                    disabled={!openProfileSettings}
                    style={{
                        ...titleBarButtonStyle(),
                        width: '36px',
                        borderRadius: 'var(--radius-pill)',
                        opacity: openProfileSettings ? 1 : 0.55,
                    }}
                >
                    <div
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'color-mix(in srgb, var(--accent) 18%, var(--surface))',
                            color: 'var(--accent)',
                            display: 'grid',
                            placeItems: 'center',
                            border: 'var(--stroke-thin) solid color-mix(in srgb, var(--accent) 28%, var(--border))',
                            fontSize: '10px',
                            fontWeight: 800,
                        }}
                    >
                        {userName === 'Pilot user' ? <UserRound size={13} /> : getInitials(userName)}
                    </div>
                </button>

                <div style={{ width: 'var(--stroke-thin)', height: '22px', backgroundColor: 'var(--border-subtle)', margin: '0 var(--space-1)' }} />

                <button
                    className="pilot-window-button"
                    type="button"
                    onClick={minimizeWindow}
                    aria-label="Minimize"
                    title="Minimize"
                    style={windowButtonStyle()}
                >
                    <Minus size={15} />
                </button>

                <button
                    className="pilot-window-button"
                    type="button"
                    onClick={toggleMaximizeWindow}
                    aria-label="Maximize"
                    title="Maximize"
                    style={windowButtonStyle()}
                >
                    <Square size={13} />
                </button>

                <button
                    className="pilot-window-button pilot-window-button-close"
                    type="button"
                    onClick={closeWindow}
                    aria-label="Close"
                    title="Close"
                    style={windowButtonStyle('close')}
                >
                    <X size={16} />
                </button>
            </div>
        </header>
    );
}
