import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

function isTheme(value: string | null): value is Theme {
    return value === 'light' || value === 'dark' || value === 'system';
}

export const ThemeContext = createContext({
    theme: 'dark' as Theme,
    setTheme: (_theme: Theme) => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return isTheme(savedTheme) ? savedTheme : 'dark';
    });

    useEffect(() => {
        const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

        function applyTheme() {
            const resolvedTheme = theme === 'system'
                ? systemQuery.matches ? 'dark' : 'light'
                : theme;

            document.documentElement.setAttribute('data-theme', resolvedTheme);
        }

        applyTheme();
        localStorage.setItem('theme', theme);

        if (theme !== 'system') {
            return;
        }

        systemQuery.addEventListener('change', applyTheme);

        return () => {
            systemQuery.removeEventListener('change', applyTheme);
        };
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
