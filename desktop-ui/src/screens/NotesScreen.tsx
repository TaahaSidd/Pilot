import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import {
    pilotApi,
    type NoteCourse,
    type NoteModule,
    type NoteFile,
    type NoteFileResponse,
} from '../api/api';

import { NotesEmptyState } from '../components/notes/NotesEmptyState';
import { NotesCourseGrid } from '../components/notes/NotesCourseGrid';
import { NotesModuleGrid } from '../components/notes/NotesModuleGrid';
import { NotesFileGrid } from '../components/notes/NotesFileGrid';
import { NotesBreadcrumb, type NotesBreadcrumbItem } from '../components/shared/NotesBreadcrumb';
import { NoteDetailScreen } from './NoteDetailScreen';
import { Button } from '../components/shared/Button';

type View = 'courses' | 'modules' | 'notes';

function normalizeTitle(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function NotesScreen({ initialCourseTitle }: { initialCourseTitle?: string | null }) {
    const [courses, setCourses] = useState<NoteCourse[]>([]);

    const [selectedCourse, setSelectedCourse] = useState<NoteCourse | null>(null);
    const [selectedModule, setSelectedModule] = useState<NoteModule | null>(null);
    const [selectedNote, setSelectedNote] = useState<NoteFileResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [openingNote, setOpeningNote] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentView: View =
        selectedModule
            ? 'notes'
            : selectedCourse
                ? 'modules'
                : 'courses';

    useEffect(() => {
        let cancelled = false;

        async function loadNotes() {
            try {
                setLoading(true);

                const data = await pilotApi.getNotesTree();

                if (!cancelled) {
                    setCourses(data.courses);
                    setError(null);
                }
            } catch {
                if (!cancelled) {
                    setError('Could not load generated notes.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadNotes();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!initialCourseTitle || selectedCourse || courses.length === 0) {
            return;
        }

        const targetTitle = normalizeTitle(initialCourseTitle);
        const matchingCourse = courses.find(
            (course) => normalizeTitle(course.title) === targetTitle
        );

        if (matchingCourse) {
            setSelectedCourse(matchingCourse);
        }
    }, [courses, initialCourseTitle, selectedCourse]);

    async function openNote(note: NoteFile) {
        try {
            setOpeningNote(true);

            const file = await pilotApi.getNoteFile(note.path);

            setSelectedNote(file);
        } catch {
            setError('Could not open this note.');
        } finally {
            setOpeningNote(false);
        }
    }

    function goToNotesRoot() {
        setSelectedNote(null);
        setSelectedModule(null);
        setSelectedCourse(null);
    }

    function goToCourse() {
        setSelectedNote(null);
        setSelectedModule(null);
    }

    function goToModule() {
        setSelectedNote(null);
    }

    function goBack() {
        if (selectedNote) {
            setSelectedNote(null);
            return;
        }

        if (selectedModule) {
            setSelectedModule(null);
            return;
        }

        if (selectedCourse) {
            setSelectedCourse(null);
        }
    }

    const breadcrumbItems: NotesBreadcrumbItem[] = [
        {
            label: 'Generated notes',
            onClick: currentView === 'courses' && !selectedNote ? undefined : goToNotesRoot,
        },
    ];

    if (selectedCourse) {
        breadcrumbItems.push({
            label: selectedCourse.title,
            onClick: selectedModule || selectedNote ? goToCourse : undefined,
        });
    }

    if (selectedModule) {
        breadcrumbItems.push({
            label: selectedModule.title,
            onClick: selectedNote ? goToModule : undefined,
        });
    }

    if (selectedNote) {
        breadcrumbItems.push({
            label: selectedNote.title,
        });
    }

    if (selectedNote) {
        return (
            <NoteDetailScreen
                note={selectedNote}
                onBack={goBack}
                breadcrumbItems={breadcrumbItems}
            />
        );
    }

    if (loading) {
        return (
            <div
                style={{
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                }}
            >
                Loading generated notes...
            </div>
        );
    }

    if (courses.length === 0) {
        return <NotesEmptyState />;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}
        >
            {currentView !== 'courses' && (
                <Button variant="ghost" icon={ArrowLeft} onClick={goBack} style={{ width: 'fit-content' }}>
                    Back
                </Button>
            )}

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
            >
                <NotesBreadcrumb items={breadcrumbItems} />

                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                    }}
                >
                    Generated Notebooks
                </h1>

                <p
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        margin: 0,
                    }}
                >
                    {currentView === 'courses' && 'Browse generated notes by course.'}

                    {currentView === 'modules' &&
                        `${selectedCourse?.title}`}

                    {currentView === 'notes' &&
                        `${selectedModule?.title}`}
                </p>
            </div>

            {error && (
                <div
                    style={{
                        color: 'var(--error)',
                        fontSize: '13px',
                    }}
                >
                    {error}
                </div>
            )}

            {currentView === 'courses' && (
                <NotesCourseGrid
                    courses={courses}
                    onSelect={setSelectedCourse}
                />
            )}

            {currentView === 'modules' && selectedCourse && (
                <NotesModuleGrid
                    modules={selectedCourse.modules}
                    onSelect={setSelectedModule}
                />
            )}

            {currentView === 'notes' && selectedModule && (
                <NotesFileGrid
                    notes={selectedModule.notes}
                    openingNote={openingNote}
                    onSelect={openNote}
                />
            )}
        </div>
    );
}
