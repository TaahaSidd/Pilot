export function Skeleton({ width = '100%', height = '16px' }: { width?: string; height?: string }) {
    return (
        <span
            className="pilot-skeleton"
            aria-hidden="true"
            style={{
                display: 'block',
                width,
                height,
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-subtle)',
            }}
        />
    );
}
