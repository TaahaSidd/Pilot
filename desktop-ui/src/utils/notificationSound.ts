type AudioWindow = Window & {
    webkitAudioContext?: typeof AudioContext;
};

export function playNotificationSound() {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const AudioContextCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

        if (!AudioContextCtor) {
            return;
        }

        const context = new AudioContextCtor();
        const oscillator = context.createOscillator();
        const secondOscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        secondOscillator.type = 'triangle';
        secondOscillator.frequency.setValueAtTime(440, now + 0.06);
        secondOscillator.frequency.exponentialRampToValueAtTime(660, now + 0.18);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
        gain.gain.setValueAtTime(0.18, now + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

        oscillator.connect(gain);
        secondOscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(now);
        secondOscillator.start(now + 0.06);
        oscillator.stop(now + 0.34);
        secondOscillator.stop(now + 0.34);
        oscillator.addEventListener('ended', () => {
            void context.close();
        });
    } catch {
        // Sound is optional. If the platform blocks it, Pilot keeps going.
    }
}
