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
import { NotesSkeleton } from '../components/shared/SkeletonScreens';
import { GuidedTour, type GuidedTourStep } from '../components/shared/GuidedTour';
import { NoteDetailScreen } from './NoteDetailScreen';
import { Button, MessageBar, PageHeader } from '../components/ui';

type View = 'courses' | 'modules' | 'notes';
const NOTE_READ_STORAGE_KEY = 'pilot-notes-read-at';

function normalizeTitle(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getNotesTourSteps(currentView: View): GuidedTourStep[] {
    if (currentView === 'courses') {
        return [
            {
                target: 'notes-header',
                title: 'Your notes library',
                description: 'This is where Pilot keeps all generated notes, grouped by course.',
            },
            {
                target: 'notes-grid',
                title: 'Open a course',
                description: 'Click a course card to see its modules and the notes inside them.',
            },
        ];
    }

    if (currentView === 'modules') {
        return [
            {
                target: 'notes-breadcrumb',
                title: 'Find your place',
                description: 'Use breadcrumbs to jump back to your notes library or course.',
            },
            {
                target: 'notes-back',
                title: 'Go back',
                description: 'Use Back when you want to return one level without losing your place.',
            },
            {
                target: 'notes-grid',
                title: 'Pick a module',
                description: 'Each module card contains the notes Pilot generated for that topic.',
            },
        ];
    }

    return [
        {
            target: 'notes-breadcrumb',
            title: 'Follow the path',
            description: 'Breadcrumbs show the course and module you are browsing right now.',
        },
        {
            target: 'notes-grid',
            title: 'Open a note',
            description: 'Click a note to read it with proper markdown formatting.',
        },
    ];
}

export function NotesScreen({ initialCourseTitle }: { initialCourseTitle?: string | null }) {
    const [courses, setCourses] = useState<NoteCourse[]>([]);
    const [readAtByPath, setReadAtByPath] = useState<Record<string, number>>({});

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
        try {
            const stored = window.localStorage.getItem(NOTE_READ_STORAGE_KEY);
            if (stored) {
                setReadAtByPath(JSON.parse(stored) as Record<string, number>);
            }
        } catch {
            window.localStorage.removeItem(NOTE_READ_STORAGE_KEY);
        }
    }, []);

    function markNoteRead(note: NoteFile) {
        const readAt = Date.now();

        setReadAtByPath((current) => {
            const next = {
                ...current,
                [note.path]: readAt,
            };

            window.localStorage.setItem(NOTE_READ_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }

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
            markNoteRead(note);
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
            label: 'Notes',
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
        return <NotesSkeleton />;
    }

    if (courses.length === 0) {
        return <NotesEmptyState />;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
            }}
        >
            {currentView !== 'courses' && (
                <Button data-tour-id="notes-back" variant="ghost" icon={ArrowLeft} onClick={goBack} style={{ width: 'fit-content' }}>
                    Back
                </Button>
            )}

            <div data-tour-id="notes-header" style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {currentView !== 'courses' && (
                    <div data-tour-id="notes-breadcrumb">
                        <NotesBreadcrumb items={breadcrumbItems} />
                    </div>
                )}

                <PageHeader
                    title={currentView === 'courses' ? 'Notes' : currentView === 'modules' ? 'Modules' : 'Study material'}
                    description={
                        currentView === 'courses'
                            ? 'Your study library, organized by course.'
                            : currentView === 'modules'
                                ? selectedCourse?.title
                                : selectedModule?.title
                    }
                />
            </div>

            {error && (
                <MessageBar
                    tone="error"
                    title="Notes could not be loaded"
                    message={error}
                />
            )}

            {currentView === 'courses' && (
                <div data-tour-id="notes-grid">
                    <NotesCourseGrid
                        courses={courses}
                        readAtByPath={readAtByPath}
                        onSelect={setSelectedCourse}
                    />
                </div>
            )}

            {currentView === 'modules' && selectedCourse && (
                <div data-tour-id="notes-grid">
                    <NotesModuleGrid
                        modules={selectedCourse.modules}
                        readAtByPath={readAtByPath}
                        onSelect={setSelectedModule}
                    />
                </div>
            )}

            {currentView === 'notes' && selectedModule && (
                <div data-tour-id="notes-grid">
                    <NotesFileGrid
                        notes={selectedModule.notes}
                        readAtByPath={readAtByPath}
                        openingNote={openingNote}
                        onSelect={openNote}
                    />
                </div>
            )}

            <GuidedTour
                storageKey={`pilot-notes-tour-${currentView}-v1`}
                steps={getNotesTourSteps(currentView)}
                devAlwaysShow
            />
        </div>
    );
}
