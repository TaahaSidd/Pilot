import type { HTMLAttributes } from 'react';

type SurfaceTone = 'canvas' | 'surface' | 'raised' | 'subtle';

const toneMap: Record<SurfaceTone, string> = {
    canvas: 'var(--background)',
    surface: 'var(--surface)',
    raised: 'var(--surface-card)',
    subtle: 'var(--surface-subtle)',
};

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
    tone?: SurfaceTone;
}

export function Surface({ tone = 'surface', style, ...props }: SurfaceProps) {
    return (
        <div
            {...props}
            style={{
                backgroundColor: toneMap[tone],
                color: 'var(--text-primary)',
                ...style,
            }}
        />
    );
}
