import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, RotateCcw, X } from 'lucide-react';
import { IconButton } from '../ui';

const ANSWERS = [
    'learn',
    'focus',
    'notes',
    'class',
    'study',
    'brain',
    'skill',
    'logic',
    'write',
    'think',
    'solve',
    'teach',
    'clear',
    'coach',
    'habit',
    'timer',
    'grade',
    'topic',
    'paper',
    'books',
];

const VALID_WORDS = new Set([
    ...ANSWERS,
    'about',
    'above',
    'actor',
    'acute',
    'admit',
    'adopt',
    'adult',
    'after',
    'again',
    'agent',
    'agree',
    'ahead',
    'alarm',
    'album',
    'alert',
    'alike',
    'alive',
    'allow',
    'alone',
    'along',
    'alter',
    'amaze',
    'apply',
    'arena',
    'argue',
    'arise',
    'array',
    'aside',
    'asset',
    'audio',
    'avoid',
    'aware',
    'badge',
    'basic',
    'batch',
    'begin',
    'bench',
    'birth',
    'black',
    'blank',
    'blend',
    'block',
    'board',
    'boost',
    'bound',
    'brand',
    'break',
    'brief',
    'bring',
    'broad',
    'build',
    'carry',
    'catch',
    'cause',
    'chain',
    'chart',
    'check',
    'chief',
    'claim',
    'clean',
    'click',
    'clock',
    'close',
    'cloud',
    'coach',
    'count',
    'cover',
    'craft',
    'crash',
    'cream',
    'daily',
    'dance',
    'debug',
    'delay',
    'depth',
    'diary',
    'draft',
    'dream',
    'drive',
    'early',
    'earth',
    'empty',
    'enter',
    'entry',
    'equal',
    'error',
    'essay',
    'event',
    'every',
    'extra',
    'field',
    'final',
    'first',
    'fixed',
    'flash',
    'flow',
    'frame',
    'fresh',
    'front',
    'given',
    'glass',
    'group',
    'guide',
    'happy',
    'heart',
    'heavy',
    'hello',
    'human',
    'ideal',
    'image',
    'index',
    'input',
    'issue',
    'joint',
    'judge',
    'known',
    'label',
    'later',
    'layer',
    'level',
    'light',
    'limit',
    'local',
    'lucky',
    'major',
    'match',
    'maybe',
    'media',
    'merge',
    'minor',
    'model',
    'money',
    'month',
    'mouse',
    'movie',
    'music',
    'night',
    'noise',
    'north',
    'novel',
    'offer',
    'often',
    'order',
    'other',
    'panel',
    'party',
    'phase',
    'phone',
    'piece',
    'pilot',
    'place',
    'plain',
    'plane',
    'plant',
    'point',
    'power',
    'press',
    'price',
    'prime',
    'print',
    'prize',
    'quick',
    'quiet',
    'range',
    'reach',
    'react',
    'ready',
    'reply',
    'right',
    'round',
    'route',
    'scale',
    'scene',
    'scope',
    'score',
    'sense',
    'serve',
    'setup',
    'share',
    'sharp',
    'shift',
    'short',
    'shown',
    'smart',
    'solid',
    'sound',
    'space',
    'speak',
    'speed',
    'spend',
    'split',
    'stack',
    'stage',
    'start',
    'state',
    'store',
    'style',
    'table',
    'taken',
    'theme',
    'there',
    'these',
    'today',
    'token',
    'touch',
    'track',
    'trial',
    'trust',
    'truth',
    'under',
    'union',
    'unity',
    'until',
    'value',
    'video',
    'visit',
    'voice',
    'watch',
    'where',
    'which',
    'while',
    'whole',
    'world',
    'write',
    'wrong',
]);

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

type TileState = 'correct' | 'present' | 'absent' | 'empty';
type GameStatus = 'playing' | 'won' | 'lost';

type SavedGame = {
    answer: string;
    guesses: string[];
    status: GameStatus;
};

interface PilotMiniGameProps {
    variant?: 'default' | 'compact';
}

function getStorageKey(answer: string) {
    return `pilot-word:${answer}`;
}

function getWordOfTheSession() {
    return ANSWERS[new Date().getDate() % ANSWERS.length];
}

function scoreGuess(guess: string, answer: string): TileState[] {
    const result: TileState[] = Array.from({ length: WORD_LENGTH }, () => 'absent');
    const remaining = answer.split('');

    for (let index = 0; index < WORD_LENGTH; index += 1) {
        if (guess[index] === answer[index]) {
            result[index] = 'correct';
            remaining[index] = '';
        }
    }

    for (let index = 0; index < WORD_LENGTH; index += 1) {
        if (result[index] === 'correct') continue;

        const foundIndex = remaining.indexOf(guess[index]);
        if (foundIndex >= 0) {
            result[index] = 'present';
            remaining[foundIndex] = '';
        }
    }

    return result;
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
        return { bg: 'var(--success)', border: 'var(--success)', color: 'var(--text-on-accent)' };
    }

    if (state === 'present') {
        return { bg: 'var(--warning)', border: 'var(--warning)', color: 'var(--text-on-accent)' };
    }

    return { bg: 'var(--surface-overlay)', border: 'var(--border)', color: 'var(--text-muted)' };
}

function getKeyboardColors(state: TileState | undefined) {
    if (state === 'correct') return { bg: 'var(--success)', color: 'var(--text-on-accent)', border: 'var(--success)' };
    if (state === 'present') return { bg: 'var(--warning)', color: 'var(--text-on-accent)', border: 'var(--warning)' };
    if (state === 'absent') return { bg: 'var(--surface-overlay)', color: 'var(--text-muted)', border: 'var(--border)' };
    return { bg: 'var(--surface-subtle)', color: 'var(--text-primary)', border: 'var(--border)' };
}

function getMessage(status: GameStatus, guesses: string[], answer: string) {
    if (status === 'won') return guesses.length <= 3 ? 'Sharp work. You got it early.' : 'Nice. You got the word.';
    if (status === 'lost') return `Answer: ${answer}`;
    return 'Guess the five letter study word.';
}

export function PilotMiniGame({ variant = 'default' }: PilotMiniGameProps) {
    const answer = useMemo(getWordOfTheSession, []);
    const storageKey = useMemo(() => getStorageKey(answer), [answer]);
    const [open, setOpen] = useState(false);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [status, setStatus] = useState<GameStatus>('playing');
    const [message, setMessage] = useState('Guess the five letter study word.');
    const [shake, setShake] = useState(false);

    const compact = variant === 'compact';
    const finished = status !== 'playing';

    useEffect(() => {
        const saved = window.localStorage.getItem(storageKey);
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved) as SavedGame;
            if (parsed.answer !== answer) return;

            setGuesses(parsed.guesses);
            setStatus(parsed.status);
            setMessage(getMessage(parsed.status, parsed.guesses, answer));
        } catch {
            window.localStorage.removeItem(storageKey);
        }
    }, [answer, storageKey]);

    useEffect(() => {
        const payload: SavedGame = { answer, guesses, status };
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
    }, [answer, guesses, status, storageKey]);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('pilot-modal-open');

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.classList.remove('pilot-modal-open');
        };
    }, [open]);

    function showTemporaryMessage(nextMessage: string) {
        setMessage(nextMessage);
        setShake(true);
        window.setTimeout(() => setShake(false), 360);
    }

    function addLetter(letter: string) {
        if (finished) return;
        setCurrentGuess((value) => (value.length < WORD_LENGTH ? `${value}${letter}` : value));
    }

    function removeLetter() {
        if (finished) return;
        setCurrentGuess((value) => value.slice(0, -1));
    }

    function submitGuess() {
        if (finished) return;

        if (currentGuess.length !== WORD_LENGTH) {
            showTemporaryMessage('Type five letters first.');
            return;
        }

        if (!VALID_WORDS.has(currentGuess)) {
            showTemporaryMessage('Try a real five letter word.');
            return;
        }

        const nextGuesses = [...guesses, currentGuess];
        const nextStatus: GameStatus = currentGuess === answer ? 'won' : nextGuesses.length >= MAX_GUESSES ? 'lost' : 'playing';

        setGuesses(nextGuesses);
        setCurrentGuess('');
        setStatus(nextStatus);
        setMessage(getMessage(nextStatus, nextGuesses, answer));

        if (nextStatus === 'playing') {
            setMessage(`${MAX_GUESSES - nextGuesses.length} guesses left.`);
        }
    }

    function resetGame() {
        setGuesses([]);
        setCurrentGuess('');
        setStatus('playing');
        setMessage('Guess the five letter study word.');
        window.localStorage.removeItem(storageKey);
    }

    function handleKey(key: string) {
        if (key === 'Enter') {
            submitGuess();
            return;
        }

        if (key === 'Backspace') {
            removeLetter();
            return;
        }

        if (/^[a-z]$/i.test(key)) {
            addLetter(key.toLowerCase());
        }
    }

    useEffect(() => {
        if (!open) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
                return;
            }

            if (event.ctrlKey || event.metaKey || event.altKey) return;

            event.preventDefault();
            handleKey(event.key);
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    const keyStates = useMemo(() => {
        const states = new Map<string, TileState>();
        const rank: Record<TileState, number> = { empty: 0, absent: 1, present: 2, correct: 3 };

        guesses.forEach((guess) => {
            scoreGuess(guess, answer).forEach((state, index) => {
                const letter = guess[index];
                const current = states.get(letter) ?? 'empty';
                if (rank[state] > rank[current]) states.set(letter, state);
            });
        });

        return states;
    }, [answer, guesses]);

    const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
        const submittedGuess = guesses[rowIndex];
        const text = submittedGuess ?? (rowIndex === guesses.length ? currentGuess : '');
        const submitted = Boolean(submittedGuess);
        const scored = submittedGuess ? scoreGuess(submittedGuess, answer) : [];

        return Array.from({ length: WORD_LENGTH }, (_, tileIndex) => ({
            letter: text[tileIndex] ?? '',
            state: submitted ? scored[tileIndex] : 'empty',
            submitted,
            active: rowIndex === guesses.length && tileIndex === currentGuess.length,
        }));
    });

    return (
        <>
            <button
                className="pilot-mini-game-card"
                onClick={() => setOpen(true)}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-card)',
                    border: 'var(--stroke-thin) solid var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                    padding: compact ? '13px 15px' : '20px',
                    display: 'grid',
                    gridTemplateColumns: compact ? 'minmax(0, 1fr) 44px' : '1fr',
                    gap: compact ? '12px' : '18px',
                    alignItems: compact ? 'center' : 'stretch',
                    width: '100%',
                    height: '100%',
                    minHeight: compact ? '100%' : '260px',
                    minWidth: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                    boxShadow: 'var(--shadow-card)',
                    transition: 'border-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)',
                }}
            >
                <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
                    <h3 className="pilot-type-subsection-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                        Pilot Word
                    </h3>
                    <p style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0 0', lineHeight: 'var(--type-body-small-line)', maxWidth: compact ? '260px' : undefined }}>
                        Quick word puzzle while Pilot works.
                    </p>
                </div>

                <span
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        justifySelf: compact ? 'end' : 'start',
                        alignSelf: compact ? 'end' : 'flex-start',
                        marginTop: compact ? 0 : 'auto',
                        width: compact ? '40px' : undefined,
                        height: compact ? '40px' : undefined,
                        border: 'var(--stroke-thin) solid var(--border-subtle)',
                        borderRadius: compact ? 'var(--radius-pill)' : 'var(--radius-control)',
                        backgroundColor: compact ? 'var(--surface-overlay)' : 'transparent',
                        color: compact ? 'var(--accent)' : 'var(--text-primary)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 'var(--type-body-small-size)',
                        fontWeight: 600,
                        padding: compact ? 0 : 'var(--space-2) var(--space-3)',
                        boxShadow: compact ? 'var(--shadow-xs)' : undefined,
                    }}
                >
                    {compact ? <Play size={18} fill="currentColor" /> : 'Play'}
                </span>
            </button>

            {open && createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    onWheel={(event) => event.preventDefault()}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'color-mix(in srgb, var(--background) 78%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-6)',
                        zIndex: 'var(--z-modal)',
                        overscrollBehavior: 'contain',
                    }}
                >
                    <div
                        onWheel={(event) => event.stopPropagation()}
                        style={{
                            width: 'min(430px, 100%)',
                            maxHeight: 'calc(100vh - 112px)',
                            overflowY: 'auto',
                            overscrollBehavior: 'contain',
                            backgroundColor: 'var(--surface-card)',
                            border: 'var(--stroke-thin) solid var(--border-subtle)',
                            borderRadius: 'var(--radius-panel)',
                            padding: 'var(--space-5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-4)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div>
                                <h3 className="pilot-type-section-title" style={{ color: 'var(--text-primary)', margin: 0 }}>
                                    Pilot Word
                                </h3>
                                <p style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0 0', lineHeight: 'var(--type-body-small-line)' }}>
                                    {message}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <IconButton
                                    icon={RotateCcw}
                                    label="Reset game"
                                    size="sm"
                                    onClick={resetGame}
                                />

                                <IconButton
                                    icon={X}
                                    label="Close game"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                />
                            </div>
                        </div>

                        <div className={shake ? 'pilot-word-board pilot-word-board-shake' : 'pilot-word-board'} style={{ display: 'grid', gap: 'var(--space-2)' }}>
                            {rows.map((row, rowIndex) => (
                                <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-2)' }}>
                                    {row.map((tile, tileIndex) => {
                                        const colors = getTileColors(tile.state, tile.submitted);

                                        return (
                                            <div
                                                key={`${rowIndex}-${tileIndex}`}
                                                className={tile.submitted ? 'pilot-word-tile pilot-word-tile-revealed' : 'pilot-word-tile'}
                                                style={{
                                                    aspectRatio: '1',
                                                    borderRadius: 'var(--radius-control)',
                                                    border: `var(--stroke-thin) solid ${tile.active ? 'var(--accent)' : colors.border}`,
                                                    backgroundColor: colors.bg,
                                                    color: colors.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    fontWeight: 850,
                                                    letterSpacing: 0,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {tile.letter}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                            {KEY_ROWS.map((row, rowIndex) => (
                                <div
                                    key={row}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 'var(--space-1)',
                                        padding: rowIndex === 1 ? '0 12px' : 0,
                                    }}
                                >
                                    {rowIndex === 2 && (
                                        <KeyButton label="Enter" wide onClick={() => handleKey('Enter')} />
                                    )}

                                    {row.split('').map((letter) => (
                                        <KeyButton
                                            key={letter}
                                            label={letter}
                                            state={keyStates.get(letter)}
                                            onClick={() => handleKey(letter)}
                                        />
                                    ))}

                                    {rowIndex === 2 && (
                                        <KeyButton label="Back" wide onClick={() => handleKey('Backspace')} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

function KeyButton({
    label,
    state,
    wide,
    onClick,
}: {
    label: string;
    state?: TileState;
    wide?: boolean;
    onClick: () => void;
}) {
    const colors = getKeyboardColors(state);

    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                minWidth: wide ? '54px' : '30px',
                height: '38px',
                borderRadius: 'var(--radius-control)',
                border: `var(--stroke-thin) solid ${colors.border}`,
                backgroundColor: colors.bg,
                color: colors.color,
                cursor: 'pointer',
                fontSize: wide ? '11px' : '13px',
                fontWeight: 800,
                padding: '0 8px',
                textTransform: wide ? 'none' : 'uppercase',
            }}
        >
            {label}
        </button>
    );
}
