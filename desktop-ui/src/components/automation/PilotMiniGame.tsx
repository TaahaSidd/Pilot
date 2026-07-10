import { useMemo, useState } from 'react';
import { Gamepad2, RotateCcw, X } from 'lucide-react';

const WORDS = ['learn', 'focus', 'notes', 'class', 'study', 'brain'];
const MAX_GUESSES = 5;
const WORD_LENGTH = 5;

type TileState = 'correct' | 'present' | 'absent' | 'empty';

function getWordOfTheSession() {
    return WORDS[new Date().getDate() % WORDS.length];
}

function getTileState(letter: string, index: number, answer: string): TileState {
    if (!letter) return 'empty';
    if (answer[index] === letter) return 'correct';
    if (answer.includes(letter)) return 'present';
    return 'absent';
}

function getTileColors(state: TileState, submitted: boolean) {
    if (!submitted || state === 'empty') {
        return {
            bg: 'var(--surface-subtle)',
            border: 'var(--border)',
            color: 'var(--text-primary)',
        };
    }

    if (state === 'correct') {
        return { bg: 'var(--success-soft)', border: 'var(--success)', color: 'var(--success)' };
    }

    if (state === 'present') {
        return { bg: 'var(--warning-soft)', border: 'var(--warning)', color: 'var(--warning)' };
    }

    return { bg: 'var(--surface-subtle)', border: 'var(--border)', color: 'var(--text-muted)' };
}

export function PilotMiniGame() {
    const answer = useMemo(getWordOfTheSession, []);
    const [open, setOpen] = useState(false);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [message, setMessage] = useState('Guess the five letter study word.');

    const won = guesses.includes(answer);
    const finished = won || guesses.length >= MAX_GUESSES;

    function submitGuess() {
        if (finished) return;

        if (currentGuess.length !== WORD_LENGTH) {
            setMessage('Enter five letters.');
            return;
        }

        const nextGuesses = [...guesses, currentGuess];
        setGuesses(nextGuesses);
        setCurrentGuess('');

        if (currentGuess === answer) {
            setMessage('Nice. You got it.');
            return;
        }

        if (nextGuesses.length >= MAX_GUESSES) {
            setMessage(`Answer: ${answer}`);
            return;
        }

        setMessage(`${MAX_GUESSES - nextGuesses.length} guesses left.`);
    }

    function resetGame() {
        setGuesses([]);
        setCurrentGuess('');
        setMessage('Guess the five letter study word.');
    }

    const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
        const submittedGuess = guesses[rowIndex];
        const text = submittedGuess ?? (rowIndex === guesses.length ? currentGuess : '');
        const submitted = Boolean(submittedGuess);

        return Array.from({ length: WORD_LENGTH }, (_, tileIndex) => ({
            letter: text[tileIndex] ?? '',
            state: getTileState(text[tileIndex] ?? '', tileIndex, answer),
            submitted,
        }));
    });

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    width: '100%',
                    height: '100%',
                    minHeight: '260px',
                    minWidth: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                }}
            >
                <div
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Gamepad2 size={20} />
                </div>

                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        Pilot Word
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '18px' }}>
                        Open a quick word puzzle while Pilot works.
                    </p>
                </div>

                <span
                    style={{
                        alignSelf: 'flex-start',
                        marginTop: 'auto',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '8px 11px',
                    }}
                >
                    Play
                </span>
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(16, 16, 20, 0.72)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        zIndex: 100,
                    }}
                >
                    <div
                        style={{
                            width: 'min(420px, 100%)',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                    Pilot Word
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '5px 0 0' }}>
                                    {message}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={resetGame}
                                    title="Reset game"
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <RotateCcw size={15} />
                                </button>

                                <button
                                    onClick={() => setOpen(false)}
                                    title="Close game"
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '7px' }}>
                            {rows.map((row, rowIndex) => (
                                <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '7px' }}>
                                    {row.map((tile, tileIndex) => {
                                        const colors = getTileColors(tile.state, tile.submitted);

                                        return (
                                            <div
                                                key={`${rowIndex}-${tileIndex}`}
                                                style={{
                                                    aspectRatio: '1',
                                                    borderRadius: '7px',
                                                    border: `1px solid ${colors.border}`,
                                                    backgroundColor: colors.bg,
                                                    color: colors.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px',
                                                    fontWeight: 800,
                                                }}
                                            >
                                                {tile.letter}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitGuess();
                            }}
                            style={{ display: 'flex', gap: '8px' }}
                        >
                            <input
                                value={currentGuess}
                                onChange={(event) => {
                                    const value = event.target.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, WORD_LENGTH);
                                    setCurrentGuess(value);
                                }}
                                disabled={finished}
                                maxLength={WORD_LENGTH}
                                placeholder={finished ? 'Done' : 'Guess'}
                                style={{
                                    minWidth: 0,
                                    flex: 1,
                                    backgroundColor: 'var(--surface-subtle)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '13px',
                                    padding: '9px 10px',
                                    outline: 'none',
                                }}
                            />

                            <button
                                type="submit"
                                disabled={finished}
                                style={{
                                    border: '1px solid transparent',
                                    borderRadius: '8px',
                                    backgroundColor: finished ? 'var(--surface-subtle)' : 'var(--accent)',
                                    color: finished ? 'var(--text-muted)' : 'var(--text-on-accent)',
                                    cursor: finished ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    padding: '0 13px',
                                }}
                            >
                                Try
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
