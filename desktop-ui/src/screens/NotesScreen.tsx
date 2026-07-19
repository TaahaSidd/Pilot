import { ArrowLeft } from 'lucide-react';

import { NotesEmptyState } from '../components/notes/NotesEmptyState';
import { NotesCourseGrid } from '../components/notes/NotesCourseGrid';
import { NotesModuleGrid } from '../components/notes/NotesModuleGrid';
import { NotesFileGrid } from '../components/notes/NotesFileGrid';
import { NotesBreadcrumb } from '../components/shared/NotesBreadcrumb';
import { NotesSkeleton } from '../components/shared/SkeletonScreens';
import { NoteDetailScreen } from './NoteDetailScreen';
import { Button, MessageBar, PageHeader } from '../components/ui';
import { useNotesScreen } from '../hooks/useNotesScreen';

export function NotesScreen({ initialCourseTitle }: { initialCourseTitle?: string | null }) {
    const notes = useNotesScreen(initialCourseTitle);
    const {
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
    } = notes;

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
                <Button variant="ghost" icon={ArrowLeft} onClick={goBack} style={{ width: 'fit-content' }}>
                    Back
                </Button>
            )}

            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {currentView !== 'courses' && (
                    <NotesBreadcrumb items={breadcrumbItems} />
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
                <NotesCourseGrid
                    courses={courses}
                    readAtByPath={readAtByPath}
                    onSelect={setSelectedCourse}
                />
            )}

            {currentView === 'modules' && selectedCourse && (
                <NotesModuleGrid
                    modules={selectedCourse.modules}
                    readAtByPath={readAtByPath}
                    onSelect={setSelectedModule}
                />
            )}

            {currentView === 'notes' && selectedModule && (
                <NotesFileGrid
                    notes={selectedModule.notes}
                    readAtByPath={readAtByPath}
                    openingNote={openingNote}
                    onSelect={openNote}
                />
            )}
        </div>
    );
}
