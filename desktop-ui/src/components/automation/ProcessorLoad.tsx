// src/components/automation/ProcessorLoad.tsx
import React from 'react';
import { Gamepad2 } from 'lucide-react';

// TEMPORARY placeholder card. Real plan (per product decision): once
// a workflow is running, this slot becomes a small game so the user
// has something to do while Pilot works. Built after the rest of the
// app is wired and functional bugs (stop endpoint, course title
// scraping) are fixed.
//
// Previously this rendered a fake "Processor Load" radial gauge with
// a hardcoded percentage and a "Stop Automation" button wired to
// console.log — i.e. a button that looked fully functional but did
// nothing. Removed rather than kept, since a non-functional button
// that LOOKS functional is worse than an honest empty state.

export function ProcessorLoad() {
    return (
        <div
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flex: '1 1 280px',
                textAlign: 'center',
            }}
        >
            <Gamepad2 size={28} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Something to do while you wait
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Coming soon
            </span>
        </div>
    );
}