// src/components/dashboard/CourseGrid.tsx
import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '../shared/Button';

interface CourseItem {
    id: string;
    title: string;
    description: string;
    progress: number;
    imageUrl: string;
}
const COURSES: CourseItem[] = [
    {
        id: '1',
        title: 'Data Structures',
        description: 'Optimizing heap and tree algorithms for large-scale datasets.',
        progress: 100,
        imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?fm=jpg&q=60&w=3000&auto=format&fit=crop'
    },
    {
        id: '2',
        title: 'Cloud Computing',
        description: 'Architecting serverless functions and microservices.',
        progress: 42,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '3',
        title: 'Machine Learning Pipelines',
        description: 'Building and training predictive validation structures using distributed models.',
        progress: 100,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '4',
        title: 'Advanced Graph Theory',
        description: 'Analyzing matrix operations, network routing models, and traversal paths.',
        progress: 15,
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '5',
        title: 'Enterprise Architecture',
        description: 'Decoupling structural dependencies using modern microservices and Spring frameworks.',
        progress: 0,
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '6',
        title: 'UI/UX Design Systems',
        description: 'Mapping typography hierarchies, grid structures, and unified interaction guidelines.',
        progress: 78,
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'
    }
];

export function CourseGrid() {
    return (
        <div>
            {/* Header section with view toggle anchor link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Enrolled Courses</h3>
                <Button variant="ghost" size="sm" icon={ExternalLink} iconPosition="right">
                    View All
                </Button>
            </div>

            {/* Grid distribution reflecting the NoteCard design rules */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {COURSES.map((course) => {
                    const isComplete = course.progress === 100;

                    return (
                        <div
                            key={course.id}
                            style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 150ms ease, border-color 150ms ease'
                            }}
                        >
                            {/* Visual Header Banner Container explicitly matching NoteCard layout */}
                            <div style={{ width: '100%', height: '140px', overflow: 'hidden', backgroundColor: 'var(--border)', position: 'relative' }}>
                                <img
                                    src={course.imageUrl}
                                    alt={course.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* floating indicator check badge right inside the graphic layout context */}
                                {isComplete && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        backgroundColor: 'var(--surface)',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        display: 'flex',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}>
                                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                                    </div>
                                )}
                            </div>

                            {/* Content Payload Block matching core typography rules */}
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                                        {course.title}
                                    </h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '18px', margin: 0 }}>
                                        {course.description}
                                    </p>
                                </div>

                                {/* Bottom Tracking Layer Matrix */}
                                <div style={{ marginTop: '4px' }}>
                                    {isComplete ? (
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Completed
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${course.progress}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{course.progress}% Processed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}