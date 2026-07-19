import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui';

export type GuidedTourStep = {
    target: string;
    title: string;
    description: string;
};

type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
};

type TooltipPosition = {
    top: string;
    left: string;
    transform: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

interface GuidedTourProps {
    steps: GuidedTourStep[];
    storageKey: string;
    enabled?: boolean;
}

function getStoredCompletion(storageKey: string) {
    try {
        return window.localStorage.getItem(storageKey) === 'done';
    } catch {
        return false;
    }
}

function setStoredCompletion(storageKey: string) {
    try {
        window.localStorage.setItem(storageKey, 'done');
    } catch {
        // Ignore storage failures. The tour can still be dismissed for this session.
    }
}

function isVisibleElement(element: HTMLElement) {
    const bounds = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return bounds.width > 0 && bounds.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

function getTourTarget(selector: string) {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return targets.find(isVisibleElement) ?? null;
}

function getTooltipPosition(rect: Rect | null): TooltipPosition {
    if (!rect) {
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            placement: 'center',
        };
    }

    const margin = 16;
    const width = 320;
    const height = 232;
    const gap = 14;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;
    const spaceBelow = viewportHeight - rect.top - rect.height;
    const spaceAbove = rect.top;
    const spaceRight = viewportWidth - rect.left - rect.width;
    const spaceLeft = rect.left;

    if (spaceBelow >= height + gap || spaceBelow >= spaceAbove) {
        const top = Math.min(viewportHeight - height - margin, rect.top + rect.height + gap);
        const left = Math.max(margin, Math.min(viewportWidth - width - margin, targetCenterX - width / 2));

        return {
            top: `${Math.max(margin, top)}px`,
            left: `${left}px`,
            transform: 'none',
            placement: 'bottom',
        };
    }

    if (spaceAbove >= height + gap) {
        const top = Math.max(margin, rect.top - height - gap);
        const left = Math.max(margin, Math.min(viewportWidth - width - margin, targetCenterX - width / 2));

        return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'none',
            placement: 'top',
        };
    }

    if (spaceLeft >= width + gap || spaceLeft >= spaceRight) {
        const top = Math.max(margin, Math.min(viewportHeight - height - margin, targetCenterY - height / 2));
        const left = Math.max(margin, rect.left - width - gap);

        return {
            top: `${top}px`,
            left: `${left}px`,
            transform: 'none',
            placement: 'left',
        };
    }

    const top = Math.max(margin, Math.min(viewportHeight - height - margin, targetCenterY - height / 2));
    const left = Math.min(viewportWidth - width - margin, rect.left + rect.width + gap);

    return {
        top: `${top}px`,
        left: `${left}px`,
        transform: 'none',
        placement: 'right',
    };
}

function getPointerStyle(rect: Rect | null, tooltipPosition: TooltipPosition) {
    if (!rect || tooltipPosition.placement === 'center') {
        return { display: 'none' };
    }

    const tooltipTop = Number.parseFloat(tooltipPosition.top);
    const tooltipLeft = Number.parseFloat(tooltipPosition.left);
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;
    const clampedLeft = Math.max(18, Math.min(286, targetCenterX - tooltipLeft - 8));
    const clampedTop = Math.max(18, Math.min(198, targetCenterY - tooltipTop - 8));
    const base = {
        position: 'absolute' as const,
        width: '16px',
        height: '16px',
        backgroundColor: 'var(--surface-overlay)',
    };

    if (tooltipPosition.placement === 'bottom') {
        return {
            ...base,
            top: '-9px',
            left: `${clampedLeft}px`,
            borderLeft: 'var(--stroke-thin) solid var(--border)',
            borderTop: 'var(--stroke-thin) solid var(--border)',
            transform: 'rotate(45deg)',
        };
    }

    if (tooltipPosition.placement === 'top') {
        return {
            ...base,
            bottom: '-9px',
            left: `${clampedLeft}px`,
            borderRight: 'var(--stroke-thin) solid var(--border)',
            borderBottom: 'var(--stroke-thin) solid var(--border)',
            transform: 'rotate(45deg)',
        };
    }

    if (tooltipPosition.placement === 'left') {
        return {
            ...base,
            right: '-9px',
            top: `${clampedTop}px`,
            borderRight: 'var(--stroke-thin) solid var(--border)',
            borderTop: 'var(--stroke-thin) solid var(--border)',
            transform: 'rotate(45deg)',
        };
    }

    return {
        ...base,
        left: '-9px',
        top: `${clampedTop}px`,
        borderLeft: 'var(--stroke-thin) solid var(--border)',
        borderBottom: 'var(--stroke-thin) solid var(--border)',
        transform: 'rotate(45deg)',
    };
}

export function GuidedTour({ steps, storageKey, enabled = true }: GuidedTourProps) {
    const [completed, setCompleted] = useState(() => getStoredCompletion(storageKey));
    const [activeIndex, setActiveIndex] = useState(0);
    const [rect, setRect] = useState<Rect | null>(null);
    const activeStep = steps[activeIndex];
    const tooltipPosition = useMemo(() => getTooltipPosition(rect), [rect]);
    const pointerStyle = useMemo(() => getPointerStyle(rect, tooltipPosition), [rect, tooltipPosition]);

    useEffect(() => {
        if (!enabled || completed || !activeStep) return;

        let frame = 0;
        let scrollFrame = 0;
        let retryTimer: ReturnType<typeof window.setTimeout> | null = null;

        const updateTarget = (shouldScroll = false) => {
            const target = getTourTarget(`[data-tour-id="${activeStep.target}"]`);

            if (!target) {
                retryTimer = window.setTimeout(() => {
                    setActiveIndex((index) => Math.min(index + 1, steps.length - 1));
                }, 160);
                return;
            }

            if (shouldScroll) {
                target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
            }

            const measure = () => {
                const bounds = target.getBoundingClientRect();
                setRect({
                    top: bounds.top,
                    left: bounds.left,
                    width: bounds.width,
                    height: bounds.height,
                });
            };

            frame = window.requestAnimationFrame(() => {
                measure();
                scrollFrame = window.requestAnimationFrame(measure);
            });
        };

        updateTarget(true);
        const recalculateTarget = () => updateTarget(false);
        window.addEventListener('resize', recalculateTarget);
        window.addEventListener('scroll', recalculateTarget, true);

        return () => {
            window.cancelAnimationFrame(frame);
            window.cancelAnimationFrame(scrollFrame);
            if (retryTimer) window.clearTimeout(retryTimer);
            window.removeEventListener('resize', recalculateTarget);
            window.removeEventListener('scroll', recalculateTarget, true);
        };
    }, [activeStep, completed, enabled, steps.length]);

    if (!enabled || completed || !activeStep) return null;

    const finishTour = () => {
        setStoredCompletion(storageKey);
        setCompleted(true);
    };

    const goNext = () => {
        if (activeIndex >= steps.length - 1) {
            finishTour();
            return;
        }

        setActiveIndex((index) => index + 1);
    };

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Pilot quick tour"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 'var(--z-toast)',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.34)',
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    width: '320px',
                    maxWidth: 'calc(100vw - 32px)',
                    ...tooltipPosition,
                    pointerEvents: 'auto',
                    backgroundColor: 'var(--surface-overlay)',
                    color: 'var(--text-primary)',
                    border: 'var(--stroke-thin) solid var(--border)',
                    borderRadius: 'var(--radius-dialog)',
                    boxShadow: 'var(--shadow-dialog)',
                    padding: 'var(--space-5)',
                    display: 'grid',
                    gap: 'var(--space-4)',
                }}
            >
                {rect && (
                    <div
                        aria-hidden="true"
                        style={pointerStyle}
                    />
                )}

                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--type-caption-size)', fontWeight: 700 }}>
                        {activeIndex + 1} of {steps.length}
                    </div>
                    <h2 className="pilot-type-subsection-title" style={{ margin: 0, color: 'var(--text-primary)' }}>
                        {activeStep.title}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--type-body-small-size)', lineHeight: 'var(--type-body-small-line)' }}>
                        {activeStep.description}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Button variant="ghost" size="sm" onClick={finishTour}>
                        Skip
                    </Button>
                    <Button size="sm" onClick={goNext}>
                        {activeIndex >= steps.length - 1 ? 'Done' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
