import { useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { NotificationEmptyState } from '../components/notifications/NotificationEmptyState';
import { Button } from '../components/shared/Button';
import { useNotifications, type NotificationType } from '../context/NotificationContext';

type NotificationFilter = 'all' | 'unread' | NotificationType;

const filters: Array<{ label: string; value: NotificationFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Info', value: 'info' },
    { label: 'Action required', value: 'action_required' },
];

export function NotificationsScreen() {
    const {
        notifications,
        unreadCount,
        markAllRead,
        markRead,
        clearNotifications,
    } = useNotifications();
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

    const visibleNotifications = notifications.filter((notification) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !notification.read;
        return notification.type === activeFilter;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '18px',
                }}
            >
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: 0 }}>
                        Updates
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '6px 0 0' }}>
                        {unreadCount === 0
                            ? 'You are all caught up.'
                            : `You have ${unreadCount} unread ${unreadCount === 1 ? 'update' : 'updates'}.`}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="secondary" icon={CheckCheck} onClick={markAllRead} disabled={unreadCount === 0}>
                        Mark all as read
                    </Button>
                    <Button variant="outline" icon={Trash2} onClick={clearNotifications} disabled={notifications.length === 0}>
                        Clear
                    </Button>
                </div>
            </div>

            <div
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '22px',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border)',
                        padding: '0 18px',
                        minHeight: '48px',
                        overflowX: 'auto',
                    }}
                >
                    {filters.map((filter) => {
                        const active = activeFilter === filter.value;

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setActiveFilter(filter.value)}
                                style={{
                                    alignSelf: 'stretch',
                                    border: 0,
                                    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                                    backgroundColor: 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                                    padding: '0 0 1px',
                                    fontSize: '13px',
                                    fontWeight: active ? 700 : 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                {visibleNotifications.length === 0 ? (
                    <div style={{ padding: '42px 18px' }}>
                        <NotificationEmptyState />
                    </div>
                ) : (
                    <div>
                        {visibleNotifications.map((notification, index) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkRead={markRead}
                                isLast={index === visibleNotifications.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
