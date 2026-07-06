import React from 'react';
import { Play } from 'lucide-react';

export function PilotMiniGame() {
    return (
        <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column', // Stacked to keep content top-left
            justifyContent: 'space-between',
            position: 'relative',    // Required to pin the button
            width: '100%',
            maxWidth: '400px',
            minHeight: '160px',
            flexShrink: 0,
        }}>
            {/* Top Content: Matches layout inspo from image_0b92ba.png */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Mini Game
                </h3>
                <p style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-secondary)', margin: 0, maxWidth: '200px' }}>
                    Engage in a session while the automation engine processes your request.
                </p>
            </div>

            {/* Bottom-Right Button: Matches layout inspo from image_0b92ba.png */}
            <button style={{
                position: 'absolute',
                right: '24px',
                bottom: '24px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#262626',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #404040',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
            }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Play size={20} strokeWidth={1.5} fill="none" />
            </button>
        </div>
    );
}