import { useEffect, useMemo, useState } from 'react';
import {
    pilotApi,
    type NoteCourse,
    type NoteModule,
    type NoteFile,
    type NoteFileResponse,
} from '../api/api';
import type { NotesBreadcrumbItem } from '../components/shared/NotesBreadcrumb';

export type NotesView = 'courses' | 'modules' | 'notes';

const NOTE_READ_STORAGE_KEY = 'pilot-notes-read-at';

function normalizeTitle(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function useNotesScreen(initialCourseTitle?: string | null) {
    const [courses, setCourses] = useState<NoteCourse[]>([]);
    const [readAtByPath, setReadAtByPath] = useState<Record<string, number>>({});

    const [selectedCourse, setSelectedCourse] = useState<NoteCourse | null>(null);
    const [selectedModule, setSelectedModule] = useState<NoteModule | null>(null);
    const [selectedNote, setSelectedNote] = useState<NoteFileResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [openingNote, setOpeningNote] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentView: NotesView =
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

    const breadcrumbItems = useMemo<NotesBreadcrumbItem[]>(() => {
        const items: NotesBreadcrumbItem[] = [
            {
                label: 'Notes',
                onClick: currentView === 'courses' && !selectedNote ? undefined : goToNotesRoot,
            },
        ];

        if (selectedCourse) {
            items.push({
                label: selectedCourse.title,
                onClick: selectedModule || selectedNote ? goToCourse : undefined,
            });
        }

        if (selectedModule) {
            items.push({
                label: selectedModule.title,
                onClick: selectedNote ? goToModule : undefined,
            });
        }

        if (selectedNote) {
            items.push({
                label: selectedNote.title,
            });
        }

        return items;
    }, [currentView, selectedCourse, selectedModule, selectedNote]);

    return {
        breadcrumbItems,
        courses,
        currentView,
        error,
        goBack,
        loading,
        openNote,
        openingNote,
        readAtByPath,
        selectedCourse,
        selectedModule,
        selectedNote,
        setSelectedCourse,
        setSelectedModule,
    };
}
