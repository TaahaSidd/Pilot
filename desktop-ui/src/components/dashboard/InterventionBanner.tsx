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
            backgroundColor: 'var(--warning-soft)',
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
                        Complete Login Verification
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        Pilot has filled your credentials. Finish the CAPTCHA in the browser, then click Continue.
                    </p>
                </div>
            </div>
            <button
                onClick={confirmLogin}
                style={{
                    backgroundColor: 'var(--warning)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                }}
            >
                Continue
            </button>
        </div>
    );
}
