// src/components/dashboard/ActivityFeed.tsx
import React, { useState } from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '../shared/Button';

interface ActivityItem {
    id: string;
    title: string;
    subtitle: string;
    time: string;
    type: 'success' | 'error' | 'info';
}

const ACTIVITIES: ActivityItem[] = [
    {
        id: '1',
        title: 'Summary Generated',
        subtitle: 'Module 4: AVL Trees - Data Structures',
        time: '2 minutes ago',
        type: 'info'
    },
    {
        id: '2',
        title: 'Amity Sync Complete',
        subtitle: 'Cloud knowledge graph updated successfully.',
        time: '15 minutes ago',
        type: 'success'
    },
    {
        id: '3',
        title: 'Task Interrupted',
        subtitle: 'ML Lab 3: API Timeout on Groq endpoint.',
        time: '1 hour ago',
        type: 'error'
    },
    {
        id: '4',
        title: 'Quiz Parsed',
        subtitle: 'Graph Theory: Advanced Graph Traversal Techniques.',
        time: '3 hours ago',
        type: 'info'
    },
    {
        id: '5',
        title: 'Session Authenticated',
        subtitle: 'LMS handshake verified via automated engine.',
        time: '5 hours ago',
        type: 'success'
    }
];

export function ActivityFeed() {
    const [visibleCount, setVisibleCount] = useState(5);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />;
            case 'error':
                return <AlertCircle size={16} style={{ color: 'var(--error)', marginTop: '2px', flexShrink: 0 }} />;
            default:
                return <FileSpreadsheet size={16} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />;
        }
    };

    const handleLoadMore = () => {
        // Placeholders for real execution cycles later
        console.log('Fetching subsequent pipeline stream logs...');
    };

    return (
        <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', marginTop: 0 }}>
                Recent Activity
            </h3>

            <div style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px', // Extra inner card padding
                display: 'flex',
                flexDirection: 'column',
                gap: '20px' // Increased structural spacing between items
            }}>
                {ACTIVITIES.slice(0, visibleCount).map((act) => (
                    <div key={act.id} style={{ display: 'flex', gap: '14px', fontSize: '13px' }}>
                        {getIcon(act.type)}
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '3px' }}>{act.subtitle}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '5px' }}>{act.time}</div>
                        </div>
                    </div>
                ))}

                {/* Microcopy action anchor wrapper */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={ChevronDown}
                        iconPosition="right"
                        fullWidth
                        onClick={handleLoadMore}
                        style={{ color: 'var(--text-muted)', fontSize: '12px' }}
                    >
                        View Older Activity
                    </Button>
                </div>
            </div>
        </div>
    );
}