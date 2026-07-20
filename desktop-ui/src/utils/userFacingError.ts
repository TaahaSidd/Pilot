const rawErrorPatterns = [
    /Workflow failed:\s*/i,
    /Error:\s*/i,
];

function normalizeErrorText(error?: string | null) {
    if (!error) return '';
    return rawErrorPatterns.reduce((text, pattern) => text.replace(pattern, ''), error).trim();
}

export function formatUserFacingError(error?: string | null) {
    const normalized = normalizeErrorText(error);
    const lower = normalized.toLowerCase();

    if (!normalized) {
        return 'Pilot ran into a problem and could not finish this run.';
    }

    if (lower.includes('charmap') || lower.includes('codec') || lower.includes('unicodeencodeerror')) {
        return 'Pilot had trouble saving some text from this run. Please try again.';
    }

    if (lower.includes('groq') && (lower.includes('quota') || lower.includes('rate limit') || lower.includes('limit reached'))) {
        return 'Your AI quota has been reached. Please try again after it resets or update your API key.';
    }

    if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('couldn\'t reach')) {
        return 'Pilot cannot reach the local backend right now. Please restart Pilot and try again.';
    }

    if (lower.includes('browser') && (lower.includes('closed') || lower.includes('crashed'))) {
        return 'The browser session closed before Pilot could finish. Start a new run when you are ready.';
    }

    if (lower.includes('login') || lower.includes('captcha')) {
        return 'Pilot needs you to complete login verification before it can continue.';
    }

    return 'Pilot ran into a problem and could not finish this run.';
}

export function formatUnknownError(error: unknown, fallback = 'Something went wrong. Please try again.') {
    if (error instanceof Error) {
        if (error.name === 'NetworkError') {
            return 'Pilot is not ready yet. Please restart the app and try again.';
        }

        return formatUserFacingError(error.message);
    }

    return fallback;
}
