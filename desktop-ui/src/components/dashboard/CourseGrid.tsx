import type { CourseSummary } from '../../hooks/usePilot';
import cardBg from '../../assets/images/card-bg.jpg';
import coursesEmpty from '../../assets/empty-states/courses.svg';
import { Card, EmptyState, ProgressBar, SectionHeader } from '../ui';

interface CourseGridProps {
    courses: CourseSummary[] | null;
    onSelectCourse?: (course: CourseSummary) => void;
}

export function CourseGrid({ courses, onSelectCourse }: CourseGridProps) {
    const emptyTitle = courses === null ? 'Your courses will show up here.' : 'No courses here yet.';
    const emptyMessage = courses === null
        ? 'Start a study run and Pilot will bring in your Amity courses.'
        : 'Once your courses are available, Pilot will organize them here.';

    return (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <SectionHeader title="Courses" meta={courses ? `${courses.length} found` : undefined} />

            {(courses === null || courses.length === 0) && (
                <Card style={{ minHeight: '320px', display: 'grid', placeItems: 'center' }}>
                    <EmptyState
                        title={emptyTitle}
                        message={emptyMessage}
                        illustration={(
                            <img
                                src={coursesEmpty}
                                alt=""
                                aria-hidden="true"
                                style={{
                                    width: '220px',
                                    maxWidth: '56%',
                                    height: 'auto',
                                }}
                            />
                        )}
                    />
                </Card>
            )}

            {courses !== null && courses.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {courses.map((course) => {
                        const isComplete = course.completion === 100;

                        return (
                            <button
                                className={onSelectCourse ? 'pilot-card pilot-card-interactive' : 'pilot-card'}
                                key={course.id ?? course.title}
                                onClick={() => onSelectCourse?.(course)}
                                style={{
                                    backgroundColor: 'var(--surface-card)',
                                    border: 'var(--stroke-thin) solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-card)',
                                    boxShadow: 'var(--shadow-card)',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '230px',
                                    padding: 0,
                                    textAlign: 'left',
                                    cursor: onSelectCourse ? 'pointer' : 'default',
                                    font: 'inherit',
                                    width: '100%',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3) var(--space-3) 0',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '104px',
                                            overflow: 'hidden',
                                            borderRadius: 'var(--radius-control)',
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
                                        padding: 'var(--space-4)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--space-3)',
                                        flex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 'var(--space-3)',
                                        }}
                                    >
                                        <h4
                                            style={{
                                                fontSize: 'var(--type-body-size)',
                                                fontWeight: 560,
                                                color: 'var(--text-primary)',
                                                margin: 0,
                                                lineHeight: 'var(--type-body-line)',
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
                                                marginBottom: 'var(--space-2)',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 'var(--type-body-small-size)',
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
                                                    fontSize: 'var(--type-body-small-size)',
                                                    fontWeight: 600,
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                {course.completion}%
                                            </span>
                                        </div>

                                        <ProgressBar
                                            value={course.completion}
                                            tone={isComplete ? 'success' : 'accent'}
                                            height="6px"
                                        />
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
