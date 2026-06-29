import React, { useState } from 'react';
import { NoteCard } from '../components/notes/NoteCard';
import { NotesEmptyState } from '../components/notes/NotesEmptyState';
import { NoteDetailScreen } from './NoteDetailScreen';

const MOCK_NOTES = [
    { id: '1', title: 'Advanced Artificial Intelligence', description: 'Comprehensive markdown records focusing on neural network cost functions, backpropagation mechanics, and weight tuners.', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60', date: 'Updated June 29, 2026' },
    { id: '2', title: 'Cloud Architecture & Microservices', description: 'Complete pipeline compilation covering AWS Lambda topologies, decoupled message streams, and performance thresholds.', imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&auto=format&fit=crop&q=60', date: 'Updated June 27, 2026' },
    { id: '3', title: 'Advanced Java Web Ecosystems', description: 'Deep dive into Spring Boot persistence filters, relational connection pools, and real-time socket listeners.', imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60', date: 'Updated June 24, 2026' }
];

export function NotesScreen() {
    const [notes, setNotes] = useState(MOCK_NOTES);
    const [selectedNote, setSelectedNote] = useState<any | null>(null);

    // If a note is selected, switch to the immersive Detail View
    if (selectedNote) {
        return <NoteDetailScreen note={selectedNote} onBack={() => setSelectedNote(null)} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>Generated Notebooks</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Review, read, and edit compiled knowledge sets.</p>
                </div>
                <button
                    onClick={() => setNotes(prev => prev.length === 0 ? MOCK_NOTES : [])}
                    style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    Simulate: {notes.length === 0 ? "Populated" : "Empty"}
                </button>
            </div>

            {notes.length === 0 ? (
                <NotesEmptyState />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            title={note.title}
                            description={note.description}
                            imageUrl={note.imageUrl}
                            date={note.date}
                            onClick={() => setSelectedNote(note)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}