import type { CourseSummary } from '../../hooks/usePilot';
import cardBg from '../../assets/images/card-bg.jpg';

interface CourseGridProps {
    courses: CourseSummary[] | null;
    onSelectCourse?: (course: CourseSummary) => void;
}

export function CourseGrid({ courses, onSelectCourse }: CourseGridProps) {

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
                            <button
                                key={course.id ?? course.title}
                                onClick={() => onSelectCourse?.(course)}
                                style={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '260px',
                                    padding: 0,
                                    textAlign: 'left',
                                    cursor: onSelectCourse ? 'pointer' : 'default',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 0',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '132px',
                                            overflow: 'hidden',
                                            borderRadius: '10px',
                                            backgroundColor: 'var(--surface-subtle)',
                                        }}
                                    >
                                        <img
                                            src={cardBg}
                                            alt={course.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />
                                    </div>
                                </div>

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
                                                letterSpacing: 0,
                                            }}
                                        >
                                            {course.title}
                                        </h4>
                                    </div>

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
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
