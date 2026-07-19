import type { ReactNode } from 'react';
import { Card } from '../ui';

export function MetricCard({
    title,
    value,
    label,
    visual,
}: {
    title: string;
    value: string | number;
    label: string;
    visual: ReactNode;
}) {
    const valueText = String(value);
    const valueIsLong = valueText.length > 5;

    return (
        <Card
            className="pilot-metric-card"
            padding="md"
            style={{
                backgroundColor: 'var(--surface)',
                border: 'var(--stroke-thin, 1px) solid var(--border)',
                boxShadow: 'var(--shadow-xs)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(76px, 104px)',
                gap: 'var(--space-5)',
                alignItems: 'center',
                minHeight: '154px',
                minWidth: 0,
                overflow: 'hidden',
            }}
        >
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--type-label-size)',
                        lineHeight: 'var(--type-label-line)',
                        fontWeight: 'var(--type-label-weight)',
                        letterSpacing: 0,
                        marginBottom: 'var(--space-3)',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        color: 'var(--text-primary)',
                        fontSize: valueIsLong ? 'clamp(24px, 2vw, 30px)' : 'clamp(26px, 3vw, 34px)',
                        fontWeight: 'var(--type-card-value-weight)',
                        letterSpacing: 0,
                        lineHeight: 1.12,
                        overflowWrap: 'anywhere',
                    }}
                >
                    {value}
                </div>
                <div
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--type-small-size)',
                        lineHeight: 'var(--type-small-line)',
                        marginTop: 'var(--space-1)',
                    }}
                >
                    {label}
                </div>
            </div>

            {visual}
        </Card>
    );
}

export function CompletionRing({
    percent,
    label,
    size = 88,
    stroke = 10,
}: {
    percent: number;
    label: string;
    size?: number;
    stroke?: number;
}) {
    const radius = (size - stroke) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                maxWidth: '100%',
                position: 'relative',
                display: 'grid',
                placeItems: 'center',
                justifySelf: 'end',
            }}
            aria-label={label}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: 'stroke-dashoffset var(--motion-slow) var(--ease-enter)' }}
                />
            </svg>
            <span
                style={{
                    position: 'absolute',
                    color: 'var(--text-primary)',
                    fontSize: '17px',
                    fontWeight: 700,
                    letterSpacing: 0,
                }}
            >
                {percent}%
            </span>
        </div>
    );
}

export function StudySegments({ percent, label }: { percent: number; label: string }) {
    return (
        <div
            aria-label={label}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 'var(--space-1)',
                width: 'min(104px, 100%)',
                height: '50px',
                alignItems: 'stretch',
            }}
        >
            {Array.from({ length: 10 }).map((_, index) => {
                const segmentPercent = ((index + 1) / 10) * 100;
                const isFilled = percent >= segmentPercent;

                return (
                    <span
                        key={index}
                        style={{
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: isFilled ? 'var(--accent)' : 'var(--surface-subtle)',
                            border: isFilled ? 'var(--stroke-thin) solid var(--accent)' : 'var(--stroke-thin) solid var(--border)',
                        }}
                    />
                );
            })}
        </div>
    );
}

export function ElapsedVisual({ percent, label }: { percent: number; label: string }) {
    return (
        <div style={{ justifySelf: 'end', width: 'min(96px, 100%)' }}>
            <div
                aria-label={label}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-1)',
                    width: '100%',
                    height: '62px',
                    alignItems: 'end',
                }}
            >
                {[0, 1, 2, 3].map((segment) => {
                    const segmentStart = segment * 25;
                    const fill = Math.max(0, Math.min((percent - segmentStart) / 25, 1));

                    return (
                        <div
                            key={segment}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: 'var(--surface-subtle)',
                                border: 'var(--stroke-thin) solid var(--border)',
                                height: '100%',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    height: `${fill * 100}%`,
                                    borderRadius: 'var(--radius-pill)',
                                    backgroundColor: 'var(--accent)',
                                    transition: 'height var(--motion-slow) var(--ease-enter)',
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
