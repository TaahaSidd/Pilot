import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: ReactNode;
    icon: LucideIcon;
}

export function StatCard({ title, value, subtext, icon: IconComponent }: StatCardProps) {
    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1,
            minWidth: 0,
            transition: 'border-color 150ms ease'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500
            }}>
                <span style={{ letterSpacing: 0 }}>{title}</span>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <IconComponent size={16} strokeWidth={2} />
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: 0,
                    lineHeight: '34px'
                }}>
                    {value}
                </div>

                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: '16px'
                }}>
                    {subtext}
                </div>
            </div>
        </div>
    );
}
