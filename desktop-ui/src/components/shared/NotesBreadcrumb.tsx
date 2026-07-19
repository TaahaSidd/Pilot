import React from 'react';
import { ChevronRight, Library } from 'lucide-react';

export interface NotesBreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface Props {
    items: NotesBreadcrumbItem[];
}

export function NotesBreadcrumb({ items }: Props) {
    return (
        <nav
            aria-label="Notes breadcrumb"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                minWidth: 0,
                color: 'var(--text-secondary)',
                fontSize: 'var(--type-small-size)',
                lineHeight: 'var(--type-small-line)',
            }}
        >
            <Library size={16} color="var(--accent)" aria-hidden="true" />

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const canNavigate = Boolean(item.onClick) && !isLast;

                return (
                    <React.Fragment key={`${item.label}-${index}`}>
                        {index > 0 && (
                            <ChevronRight
                                size={14}
                                color="var(--text-muted)"
                                aria-hidden="true"
                                style={{ flex: '0 0 auto' }}
                            />
                        )}

                        <button
                            type="button"
                            onClick={canNavigate ? item.onClick : undefined}
                            disabled={!canNavigate}
                            aria-current={isLast ? 'page' : undefined}
                            style={{
                                border: 0,
                                padding: 0,
                                margin: 0,
                                minWidth: 0,
                                maxWidth: isLast ? '420px' : '280px',
                                background: 'transparent',
                                color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: canNavigate ? 'pointer' : 'default',
                                font: 'inherit',
                                fontWeight: isLast ? 600 : 500,
                                letterSpacing: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={item.label}
                        >
                            {item.label}
                        </button>
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
