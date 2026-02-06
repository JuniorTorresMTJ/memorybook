import { createContext, useContext, useState } from 'react';
import { translations } from '../constants/translations';
import type { LanguageCode } from '../constants/translations';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: typeof translations['en'];
}

const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'pt', 'es', 'de', 'fr'];

/**
 * Detect the best matching language from the browser/device settings.
 * Falls back to 'en' (English) if no match is found.
 */
function detectBrowserLanguage(): LanguageCode {
    try {
        // navigator.languages gives ordered list of user's preferred languages
        const browserLanguages = navigator.languages ?? [navigator.language];

        for (const lang of browserLanguages) {
            // lang can be like "pt-BR", "en-US", "es", "fr-FR", etc.
            const code = lang.split('-')[0].toLowerCase();
            if (SUPPORTED_LANGUAGES.includes(code as LanguageCode)) {
                return code as LanguageCode;
            }
        }
    } catch {
        // SSR or navigator not available
    }

    return 'en'; // Default to English
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>(detectBrowserLanguage);

    const value = {
        language,
        setLanguage,
        t: translations[language]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
