// src/components/dashboard/InterventionBanner.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface InterventionBannerProps {
    awaitingLogin: boolean;
    confirmLogin: () => void;
}

export function InterventionBanner({ awaitingLogin, confirmLogin }: InterventionBannerProps) {
    if (!awaitingLogin) return null;

    return (
        <div style={{
            border: '1px solid var(--warning)',
            backgroundColor: 'rgba(255, 183, 121, 0.05)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} style={{ color: 'var(--warning)', marginTop: '2px' }} />
                <div>
                    <h4 style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                        Action Required: Check Headless Browser Window
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        A login prompt or CAPTCHA sequence was intercepted. Solve it, then report validation complete.
                    </p>
                </div>
            </div>
            <button
                onClick={confirmLogin}
                style={{
                    backgroundColor: 'var(--warning)',
                    color: '#0D0D0D',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                }}
            >
                Verification Cleared
            </button>
        </div>
    );
}