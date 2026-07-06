// src/components/dashboard/CourseGrid.tsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { CourseSummary } from '../../hooks/usePilot';

interface CourseGridProps {
    courses: CourseSummary[] | null;
}

export function CourseGrid({ courses }: CourseGridProps) {
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                }}
            >
                <h3
                    style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                    }}
                >
                    Courses
                </h3>

                {courses && (
                    <span
                        style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                        }}
                    >
                        {courses.length} found
                    </span>
                )}
            </div>

            {courses === null && (
                <div
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '32px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                    }}
                >
                    No course data yet. Start an automation run to see live progress here.
                </div>
            )}

            {courses !== null && courses.length === 0 && (
                <div
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '32px',
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                    }}
                >
                    No courses found on the portal for this account.
                </div>
            )}

            {courses !== null && courses.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {courses.map((course) => {
                        const isComplete = course.completion === 100;

                        return (
                            <div
                                key={course.id ?? course.title}
                                style={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '260px',
                                }}
                            >
                                {course.image ? (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            overflow: 'hidden',
                                            backgroundColor: 'var(--border)',
                                        }}
                                    >
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            background:
                                                'linear-gradient(135deg, rgba(170,0,255,0.24), rgba(170,0,255,0.05))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent)',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        Pilot Course
                                    </div>
                                )}

                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        flex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '10px',
                                        }}
                                    >
                                        <h4
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                margin: 0,
                                                lineHeight: '20px',
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            {course.title}
                                        </h4>

                                        {isComplete && (
                                            <CheckCircle2
                                                size={18}
                                                style={{
                                                    color: 'var(--success)',
                                                    flexShrink: 0,
                                                    marginTop: '1px',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {course.category && (
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {course.category}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'auto' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: isComplete
                                                        ? 'var(--success)'
                                                        : 'var(--text-secondary)',
                                                }}
                                            >
                                                {isComplete ? 'Completed' : 'In Progress'}
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                {course.completion}%
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                width: '100%',
                                                height: '6px',
                                                backgroundColor: 'var(--border)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${course.completion}%`,
                                                    height: '100%',
                                                    backgroundColor: isComplete
                                                        ? 'var(--success)'
                                                        : 'var(--accent)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}