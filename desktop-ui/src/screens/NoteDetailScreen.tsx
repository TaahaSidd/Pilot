import { ArrowLeft } from 'lucide-react';
import type { NoteFileResponse } from '../api/api';
import { Button } from '../components/shared/Button';
import { MarkdownNoteViewer } from '../components/notes/MarkdownNoteViewer';
import { NotesBreadcrumb, type NotesBreadcrumbItem } from '../components/shared/NotesBreadcrumb';

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
        <div style={{ padding: '0 24px', maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Button variant="ghost" icon={ArrowLeft} onClick={onBack} style={{ width: 'fit-content' }}>
                        Back
                    </Button>

                    <NotesBreadcrumb items={breadcrumbItems} />
                </div>

                <article style={{ color: 'var(--text-primary)' }}>
                    <h2 style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, letterSpacing: 0, margin: 0 }}>
                        {pathParts.course} / {pathParts.module}
                    </h2>
                    <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: '1.2', margin: '8px 0 24px' }}>
                        {note.title}
                    </h1>

                    <MarkdownNoteViewer
                        content={note.content}
                        skipLineIndex={duplicateTitleLineIndex}
                    />
                </article>
            </div>
        </div>
    );
}
