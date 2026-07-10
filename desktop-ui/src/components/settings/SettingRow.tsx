// src/components/settings/SettingRow.tsx
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
                padding: '16px 0',
                borderBottom: '1px solid var(--border)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'opacity 150ms ease'
            }}
        >
            {/* Left Content Cluster without Icons */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '16px' }}>
                        {description}
                    </div>
                </div>
            </div>

            {/* Right Action Cluster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {actionLabel && (
                    <span style={{
                        fontSize: '12px',
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
