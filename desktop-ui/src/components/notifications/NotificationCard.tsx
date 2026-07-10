import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react';
import type { PilotNotification } from '../../context/NotificationContext';

function getTypeLabel(type: PilotNotification['type']) {
    if (type === 'action_required') return 'Action required';
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function getMeta(type: PilotNotification['type']) {
    if (type === 'success') return { icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-soft)' };
    if (type === 'warning') return { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-soft)' };
    if (type === 'error') return { icon: AlertCircle, color: 'var(--error)', bg: 'var(--error-soft)' };
    if (type === 'action_required') return { icon: Bell, color: 'var(--warning)', bg: 'var(--warning-soft)' };
    return { icon: Info, color: 'var(--accent)', bg: 'var(--accent-soft)' };
}

function formatTime(iso: string) {
    const date = new Date(iso);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function NotificationCard({
    notification,
    onMarkRead,
    isLast = false,
}: {
    notification: PilotNotification;
    onMarkRead: (id: string) => void;
    isLast?: boolean;
}) {
    const meta = getMeta(notification.type);
    const Icon = meta.icon;

    return (
        <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            style={{
                width: '100%',
                border: 0,
                borderBottom: isLast ? 0 : '1px solid var(--border)',
                borderRadius: 0,
                backgroundColor: notification.read ? 'var(--surface)' : 'var(--surface-subtle)',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: '42px minmax(0, 1fr) minmax(96px, auto)',
                gap: '14px',
                alignItems: 'center',
                textAlign: 'left',
                color: 'inherit',
                cursor: 'pointer',
            }}
        >
            <span
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: meta.bg,
                    color: meta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon size={18} />
            </span>

            <span style={{ minWidth: 0 }}>
                <span
                    style={{
                        display: 'block',
                        color: 'var(--text-primary)',
                        fontSize: '15px',
                        fontWeight: notification.read ? 600 : 700,
                        lineHeight: '21px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {notification.title}
                </span>
                <span
                    style={{
                        display: 'block',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        lineHeight: '19px',
                        marginTop: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {notification.message}
                </span>
            </span>

            <span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                }}
            >
                {!notification.read && (
                    <span
                        style={{
                            borderRadius: '999px',
                            backgroundColor: 'var(--accent-soft)',
                            color: 'var(--accent)',
                            padding: '4px 9px',
                            fontWeight: 700,
                        }}
                    >
                        New
                    </span>
                )}
                <span>{getTypeLabel(notification.type)}</span>
                <span>{formatTime(notification.createdAt)}</span>
            </span>
        </button>
    );
}
