import notificationsEmpty from '../../assets/empty-states/notifications.svg';
import { EmptyState } from '../ui';

export function NotificationEmptyState() {
    return (
        <div style={{ minHeight: '320px', display: 'grid', placeItems: 'center' }}>
            <EmptyState
                title="No notifications yet."
                message="Pilot will notify you when a run finishes or needs attention."
                illustration={
                    <img
                        src={notificationsEmpty}
                        alt=""
                        aria-hidden="true"
                        style={{
                            width: '180px',
                            maxWidth: '52%',
                            height: 'auto',
                            opacity: 0.92,
                        }}
                    />
                }
            />
        </div>
    );
}
