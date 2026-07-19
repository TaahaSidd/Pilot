import { useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { NotificationEmptyState } from '../components/notifications/NotificationEmptyState';
import { Button, Card, PageHeader } from '../components/ui';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <PageHeader
                title="Updates"
                description={unreadCount === 0
                    ? 'You are all caught up.'
                    : `You have ${unreadCount} unread ${unreadCount === 1 ? 'update' : 'updates'}.`}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" icon={CheckCheck} onClick={markAllRead} disabled={unreadCount === 0}>
                        Mark all as read
                    </Button>
                    <Button variant="outline" icon={Trash2} onClick={clearNotifications} disabled={notifications.length === 0}>
                        Clear
                    </Button>
                    </div>
                }
            />

            <Card padding="sm" style={{ overflow: 'hidden', padding: 0 }}>
                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-6)',
                        alignItems: 'center',
                        borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                        padding: '0 var(--space-5)',
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
                                    borderBottom: `var(--stroke-focus) solid ${active ? 'var(--accent)' : 'transparent'}`,
                                    backgroundColor: 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                                    padding: '0 0 1px',
                                    fontSize: 'var(--type-small-size)',
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
                    <NotificationEmptyState />
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
            </Card>
        </div>
    );
}
