import { ChevronRight } from 'lucide-react';

interface SettingRowProps {
    label: string;
    description: string;
    actionLabel?: string;
    onClick?: () => void;
}

export function SettingRow({ label, description, actionLabel, onClick }: SettingRowProps) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-5)',
                padding: 'var(--space-4) 0',
                borderBottom: 'var(--stroke-thin) solid var(--border-subtle)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'opacity var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 'var(--type-body-size)', fontWeight: 550, color: 'var(--text-primary)', letterSpacing: 0 }}>
                        {label}
                    </div>
                    <div style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--text-muted)', marginTop: 'var(--space-1)', lineHeight: 'var(--type-body-small-line)' }}>
                        {description}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                {actionLabel && (
                    <span style={{
                        fontSize: 'var(--type-body-small-size)',
                        color: 'var(--text-secondary)',
                        fontWeight: 500
                    }}>
                        {actionLabel}
                    </span>
                )}
                {onClick && <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
            </div>
        </div>
    );
}
