import { ArrowLeft } from 'lucide-react';
import type { NoteFileResponse } from '../api/api';
import { Button } from '../components/ui';
import { MarkdownNoteViewer } from '../components/notes/MarkdownNoteViewer';
import { NotesBreadcrumb, type NotesBreadcrumbItem } from '../components/shared/NotesBreadcrumb';
import { GuidedTour, type GuidedTourStep } from '../components/shared/GuidedTour';

function getPathParts(path: string) {
    const parts = path.split('/').filter(Boolean);

    return {
        course: parts[0] ?? 'Generated notes',
        module: parts.length > 2 ? parts[1] : 'Notes library',
    };
}

function normalizeTitle(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getHeadingText(line: string) {
    return line.match(/^(#{1,3})\s+(.+)$/)?.[2].trim() ?? null;
}

function getDuplicateTitleLineIndex(content: string, noteTitle: string) {
    const lines = content.split('\n');
    const firstContentLineIndex = lines.findIndex((line) => line.trim());

    if (firstContentLineIndex === -1) {
        return null;
    }

    const headingText = getHeadingText(lines[firstContentLineIndex]);

    if (!headingText) {
        return null;
    }

    return normalizeTitle(headingText) === normalizeTitle(noteTitle)
        ? firstContentLineIndex
        : null;
}

const noteDetailTourSteps: GuidedTourStep[] = [
    {
        target: 'note-detail-back',
        title: 'Back to notes',
        description: 'Use this to return to the note list for the current module.',
    },
    {
        target: 'note-detail-breadcrumb',
        title: 'Note location',
        description: 'This path shows where the note belongs in your course library.',
    },
    {
        target: 'note-reader',
        title: 'Read markdown notes',
        description: 'Pilot formats headings, lists, code, and key terms so the note is easier to study.',
    },
];

export function NoteDetailScreen({
    note,
    onBack,
    breadcrumbItems,
}: {
    note: NoteFileResponse,
    onBack: () => void,
    breadcrumbItems: NotesBreadcrumbItem[],
}) {
    const pathParts = getPathParts(note.path);
    const duplicateTitleLineIndex = getDuplicateTitleLineIndex(note.content, note.title);

    return (
        <div style={{ maxWidth: 'var(--layout-readable)', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Button data-tour-id="note-detail-back" variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                        Back
                    </Button>

                    <div data-tour-id="note-detail-breadcrumb">
                        <NotesBreadcrumb items={breadcrumbItems} />
                    </div>
                </div>

                <article style={{ color: 'var(--text-primary)', paddingBottom: 'var(--space-16)' }}>
                    <div style={{ color: 'var(--accent)', fontSize: 'var(--type-label-size)', fontWeight: 600, lineHeight: 'var(--type-label-line)', marginBottom: 'var(--space-2)' }}>
                        {pathParts.course} / {pathParts.module}
                    </div>
                    <h1 style={{ fontSize: 'clamp(34px, 4vw, 42px)', fontWeight: 700, lineHeight: '1.18', margin: '0 0 var(--space-8)', letterSpacing: 0 }}>
                        {note.title}
                    </h1>

                    <div data-tour-id="note-reader">
                        <MarkdownNoteViewer
                            content={note.content}
                            skipLineIndex={duplicateTitleLineIndex}
                        />
                    </div>
                </article>
            </div>

            <GuidedTour
                storageKey="pilot-note-reader-tour-v1"
                steps={noteDetailTourSteps}
                devAlwaysShow
            />
        </div>
    );
}
