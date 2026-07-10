import { useState } from 'react';
import {
    Bell,
    BookOpen,
    ChevronDown,
    FileText,
    Search,
    Settings,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';

const PILOT_REPO_URL = 'https://github.com/TaahaSidd/Pilot';

const categories = [
    {
        title: 'Getting Started',
        icon: Sparkles,
        items: ['Initial setup', 'Logging in', 'First study run'],
        summary: 'Set up Pilot, connect your account, and start your first study run from the dashboard.',
    },
    {
        title: 'Study Runs',
        icon: BookOpen,
        items: ['Start or stop runs', 'Resume progress', 'CAPTCHA verification', 'Study workflow'],
        summary: 'Learn how Pilot studies your Amity material, tracks progress, and handles login checks.',
    },
    {
        title: 'Notes',
        icon: FileText,
        items: ['Generate notes', 'Browse notes', 'Note organization', 'Opening markdown files'],
        summary: 'Generate notes from study material and browse them by course, module, and note file.',
    },
    {
        title: 'Notifications',
        icon: Bell,
        items: ['Desktop notifications', 'Login required', 'Quota reached', 'Run completed'],
        summary: 'Understand the updates Pilot sends when a run finishes or needs your attention.',
    },
    {
        title: 'Settings',
        icon: Settings,
        items: ['Account', 'AI provider', 'Appearance', 'Notifications'],
        summary: 'Manage your profile, Amity login details, notification preferences, and app information.',
    },
    {
        title: 'Troubleshooting',
        icon: ShieldAlert,
        items: ['Login issues', 'Browser not opening', 'AI quota reached', 'Notes missing', 'Run stopped unexpectedly'],
        summary: 'Fix common problems like login verification, quota limits, missing notes, and interrupted runs.',
    },
];

const questions = [
    {
        question: 'Why did my study run stop?',
        answer: 'A run may stop if you clicked Stop, login verification was needed, the browser closed, or Pilot reached an AI quota limit.',
    },
    {
        question: 'Why am I seeing CAPTCHA?',
        answer: 'Amity may ask for CAPTCHA to verify the login. Complete it in the browser, then return to Pilot and continue.',
    },
    {
        question: 'Where are my notes stored?',
        answer: 'Generated notes appear in the Notes screen, grouped by course, module, and note file.',
    },
    {
        question: 'What happens if my AI quota is reached?',
        answer: 'Pilot stops notes generation and shows a clear update. You can update your API key or wait until your quota resets.',
    },
    {
        question: 'Can I continue from where I stopped?',
        answer: 'Pilot shows where the last run stopped so you can start again with better context.',
    },
    {
        question: 'Is my login saved securely?',
        answer: 'Pilot stores your details locally for the desktop app. You can update them anytime from Settings.',
    },
];

function getArticleText(categoryTitle: string, item: string) {
    const text: Record<string, string> = {
        'Initial setup': 'Add your Groq API key, Amity login details, phone number, and display name during onboarding.',
        'Logging in': 'Pilot opens the Amity portal and helps fill your login details. If Amity asks for verification, complete it in the browser.',
        'First study run': 'Start from the Dashboard. Pilot will open your course material, track progress, and show updates as it works.',
        'Start or stop runs': 'Use Start Study Run to begin and Stop to end the current run. Stopped runs show a simple summary on the Dashboard.',
        'Resume progress': 'Use the latest session summary and History screen to see where you stopped before starting again.',
        'CAPTCHA verification': 'If CAPTCHA appears, finish it in the browser and return to Pilot. The Dashboard will show an action banner when needed.',
        'Study workflow': 'Pilot checks login, opens courses, reads study material, and saves progress updates in a student-friendly way.',
        'Generate notes': 'Use Generate Notes on the Dashboard. Pilot reads available material and creates markdown notes where possible.',
        'Browse notes': 'Open Notes from the sidebar to browse generated notes by course, module, and note file.',
        'Note organization': 'Notes are grouped by course first, then module, then individual markdown files.',
        'Opening markdown files': 'Click a note file to open a formatted markdown reader with readable headings, lists, and emphasis.',
        'Desktop notifications': 'Desktop notifications are prepared for a future Windows notification integration.',
        'Login required': 'Pilot notifies you when Amity needs login verification before it can continue.',
        'Quota reached': 'If the AI quota is reached, Pilot stops notes generation and shows a clear update.',
        'Run completed': 'Pilot sends an update when a study run or notes generation completes.',
        'Account': 'Update your display name, Amity username, password, and phone number from Settings.',
        'AI provider': 'Your Groq API key is managed from your profile details. This powers notes generation.',
        'Appearance': 'Use the theme control in the top bar to switch between light and dark mode.',
        'Notifications': 'Choose which Pilot updates appear in-app, as toast messages, or later as desktop notifications.',
        'Login issues': 'Check your Amity credentials in Settings and complete any browser verification when prompted.',
        'Browser not opening': 'Make sure the local Pilot backend is running, then start a new study run from the Dashboard.',
        'AI quota reached': 'Wait for your quota to reset or update your API key in Settings.',
        'Notes missing': 'Open Notes and check the matching course/module. Some pages may be skipped if AI generation fails.',
        'Run stopped unexpectedly': 'Open History to see the last session summary and what Pilot was doing when the run ended.',
    };

    return text[item] ?? `${item} guidance for ${categoryTitle}.`;
}

function CategoryCard({
    category,
    active,
    onClick,
}: {
    category: (typeof categories)[number];
    active: boolean;
    onClick: () => void;
}) {
    const Icon = category.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--surface)',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'grid',
                gap: '14px',
                textAlign: 'left',
                color: 'inherit',
                cursor: 'pointer',
                minHeight: '178px',
                boxShadow: active ? 'var(--shadow-focus)' : undefined,
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
        >
            <Icon
                size={118}
                strokeWidth={1.25}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    right: '-18px',
                    bottom: '-22px',
                    color: 'var(--accent)',
                    opacity: active ? 0.18 : 0.11,
                    pointerEvents: 'none',
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, alignSelf: 'end' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 800, margin: '0 0 10px' }}>
                    {category.title}
                </h2>
                <div style={{ display: 'grid', gap: '6px' }}>
                    {category.items.map((item) => (
                        <div key={item} style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '18px' }}>
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </button>
    );
}

function CategoryDetail({
    category,
    selectedArticle,
    onSelectArticle,
}: {
    category: (typeof categories)[number];
    selectedArticle: string | null;
    onSelectArticle: (article: string) => void;
}) {
    return (
        <section
            style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'grid',
                gap: '14px',
            }}
        >
            <div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>
                    {category.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '20px', margin: 0 }}>
                    {category.summary}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {category.items.map((item) => (
                    <button
                        type="button"
                        key={item}
                        onClick={() => onSelectArticle(item)}
                        style={{
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            padding: '12px',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            fontWeight: 700,
                            backgroundColor: 'var(--surface-subtle)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            font: 'inherit',
                        }}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {selectedArticle && (
                <div
                    style={{
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '16px',
                        backgroundColor: 'var(--background)',
                    }}
                >
                    <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
                        {selectedArticle}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '20px', margin: 0 }}>
                        {getArticleText(category.title, selectedArticle)}
                    </p>
                </div>
            )}
        </section>
    );
}

function FAQItem({
    item,
    open,
    onToggle,
}: {
    item: (typeof questions)[number];
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
            <button
                type="button"
                onClick={onToggle}
                style={{
                    width: '100%',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '18px',
                    textAlign: 'left',
                    font: 'inherit',
                    fontSize: '14px',
                    fontWeight: 700,
                }}
            >
                {item.question}
                <ChevronDown
                    size={16}
                    color="var(--text-muted)"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}
                />
            </button>
            {open && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '20px', margin: '0 0 16px' }}>
                    {item.answer}
                </p>
            )}
        </div>
    );
}

export function HelpScreen() {
    const [openQuestion, setOpenQuestion] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '34px', maxWidth: '1060px', margin: '0 auto', width: '100%' }}>
            <section
                style={{
                    display: 'grid',
                    gap: '20px',
                    justifyItems: 'center',
                    textAlign: 'center',
                    padding: '22px 0 10px',
                }}
            >
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: 0, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                        Help Center
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '22px', margin: 0 }}>
                        Everything you need to use Pilot as your Amity study assistant.
                    </p>
                </div>

                <label
                    style={{
                        maxWidth: '520px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-muted)',
                    }}
                >
                    <Search size={17} />
                    <input
                        placeholder="Search help..."
                        readOnly
                        style={{
                            width: '100%',
                            border: 0,
                            outline: 0,
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            font: 'inherit',
                            fontSize: '14px',
                        }}
                    />
                </label>
            </section>

            <section style={{ display: 'grid', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textAlign: 'center' }}>
                    Browse help topics
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.title}
                            category={category}
                            active={selectedCategory.title === category.title}
                            onClick={() => {
                                setSelectedCategory(category);
                                setSelectedArticle(null);
                            }}
                        />
                    ))}
                </div>
            </section>

            <CategoryDetail
                category={selectedCategory}
                selectedArticle={selectedArticle}
                onSelectArticle={setSelectedArticle}
            />

            <section style={{ display: 'grid', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Popular questions
                </h2>
                <div
                    style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '0 18px',
                    }}
                >
                    {questions.map((item, index) => (
                        <FAQItem
                            key={item.question}
                            item={item}
                            open={openQuestion === index}
                            onToggle={() => setOpenQuestion(openQuestion === index ? -1 : index)}
                        />
                    ))}
                </div>
            </section>

            <section
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '18px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '22px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                }}
            >
                <div style={{ display: 'grid', gap: '4px' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 800 }}>
                        Still need help?
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => window.open(`${PILOT_REPO_URL}/issues`, '_blank', 'noopener,noreferrer')}
                        style={{ border: 0, background: 'transparent', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                    >
                        Report an issue
                    </button>
                    <button
                        type="button"
                        onClick={() => window.open(PILOT_REPO_URL, '_blank', 'noopener,noreferrer')}
                        style={{ border: 0, background: 'transparent', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                    >
                        GitHub
                    </button>
                </div>
            </section>
        </div>
    );
}
