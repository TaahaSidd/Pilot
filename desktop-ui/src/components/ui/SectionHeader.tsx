import type { ReactNode } from 'react';

export function SectionHeader({ title, meta }: { title: string; meta?: ReactNode }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <h2 className="pilot-type-section-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                {title}
            </h2>
            {meta && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--type-label-size)' }}>{meta}</div>}
        </div>
    );
}
