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
            </div>

            {/* No run has reported a summary yet this session — this is
                an honest empty state, not a loading spinner, since
                there's nothing to wait for until the user starts a run. */}
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
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                    }}
                >
                    {courses.map((course) => {
                        const isComplete = course.completion === 100;

                        return (
                            <div
                                key={course.title}
                                style={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                    }}
                                >
                                    <h4
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            margin: 0,
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {course.title}
                                    </h4>
                                    {isComplete && (
                                        <CheckCircle2
                                            size={18}
                                            style={{ color: 'var(--success)', flexShrink: 0 }}
                                        />
                                    )}
                                </div>

                                {isComplete ? (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: 'var(--success)',
                                        }}
                                    >
                                        Completed
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontSize: '12px',
                                            color: 'var(--text-muted)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                flex: 1,
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
                                                    backgroundColor: 'var(--accent)',
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>
                                            {course.completion}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}