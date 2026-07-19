import { Card, Skeleton } from '../ui';

function SkeletonCard({ height = '180px' }: { height?: string }) {
    return (
        <Card style={{ minHeight: height, display: 'grid', gap: 'var(--space-4)', alignContent: 'center' }}>
            <Skeleton width="44%" height="14px" />
            <Skeleton width="30%" height="42px" />
            <Skeleton width="62%" height="14px" />
        </Card>
    );
}

function CourseCardSkeleton() {
    return (
        <Card style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <Skeleton height="132px" />
            <Skeleton width="88%" height="18px" />
            <Skeleton width="72%" height="18px" />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                <Skeleton width="92px" height="14px" />
                <Skeleton width="46px" height="14px" />
            </div>
            <Skeleton height="7px" />
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div
            aria-label="Loading dashboard"
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 400px)',
                gap: 'var(--space-5)',
                alignItems: 'start',
            }}
        >
            <div style={{ display: 'grid', gap: 'var(--space-6)', minWidth: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                        <Skeleton width="96px" height="22px" />
                        <Skeleton width="54px" height="14px" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                        {Array.from({ length: 6 }, (_, index) => (
                            <CourseCardSkeleton key={index} />
                        ))}
                    </div>
                </section>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-5)', minWidth: 0 }}>
                <SkeletonCard height="300px" />
                <SkeletonCard height="96px" />
            </div>
        </div>
    );
}

export function NotesSkeleton() {
    return (
        <div aria-label="Loading notes" style={{ display: 'grid', gap: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <Skeleton width="120px" height="16px" />
                <Skeleton width="220px" height="32px" />
                <Skeleton width="360px" height="16px" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {Array.from({ length: 6 }, (_, index) => (
                    <Card key={index} style={{ minHeight: '132px', display: 'grid', gap: 'var(--space-4)', alignContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                            <Skeleton width="72%" height="22px" />
                            <Skeleton width="52px" height="24px" />
                        </div>
                        <Skeleton width="56%" height="16px" />
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function HistorySkeleton() {
    return (
        <div aria-label="Loading history" style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Skeleton width="180px" height="42px" />
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Skeleton width="128px" height="42px" />
                    <Skeleton width="142px" height="42px" />
                </div>
            </div>

            <Card padding="sm" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 3.5fr 1.5fr 1.2fr 1fr',
                        padding: 'var(--space-3) var(--space-5)',
                        borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                        backgroundColor: 'var(--surface-subtle)',
                        gap: 'var(--space-4)',
                    }}
                >
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} height="12px" />
                    ))}
                </div>

                <div style={{ display: 'grid' }}>
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.2fr 3.5fr 1.5fr 1.2fr 1fr',
                                gap: 'var(--space-4)',
                                padding: 'var(--space-5)',
                                borderBottom: index === 4 ? 0 : 'var(--stroke-thin) solid var(--border-subtle)',
                            }}
                        >
                            <Skeleton height="16px" />
                            <Skeleton height="18px" />
                            <Skeleton height="16px" />
                            <Skeleton height="16px" />
                            <Skeleton height="24px" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
