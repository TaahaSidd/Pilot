import { Bell } from 'lucide-react';

export function NotificationEmptyState() {
    return (
        <div
            style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backgroundColor: 'var(--surface)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
            }}
        >
            <Bell size={28} color="var(--text-muted)" />
            <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>
                No notifications yet.
            </div>
            <div style={{ fontSize: '13px' }}>
                Pilot will notify you when a run finishes or needs attention.
            </div>
        </div>
    );
}
