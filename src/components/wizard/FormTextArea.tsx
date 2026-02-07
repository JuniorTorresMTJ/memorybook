import { useState, useCallback } from 'react';
import { Wand2, Loader2, Undo2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { enhanceText } from '../../lib/api';

interface FormTextAreaProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    helperText?: string;
    icon?: React.ReactNode;
    /** Context hint for AI enhancement (e.g. 'childhood', 'teenage') */
    enhanceContext?: string;
}

export const FormTextArea = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    rows = 3,
    helperText,
    icon,
    enhanceContext,
}: FormTextAreaProps) => {
    const { t, language } = useLanguage();
    const wz = t.wizard;

    const [isFocused, setIsFocused] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [originalText, setOriginalText] = useState<string | null>(null);

    const langCodeMap: Record<string, string> = {
        pt: 'pt-BR', en: 'en-US', es: 'es-ES', de: 'de-DE', fr: 'fr-FR',
    };

    const handleEnhance = useCallback(async () => {
        if (!value.trim() || isEnhancing) return;

        setIsEnhancing(true);
        setOriginalText(value);
        try {
            const enhanced = await enhanceText(
                value,
                enhanceContext || id,
                langCodeMap[language] || 'pt-BR',
            );
            onChange(enhanced);
        } catch (err) {
            console.error('[FormTextArea] Enhancement failed:', err);
            setOriginalText(null);
        } finally {
            setIsEnhancing(false);
        }
    }, [value, isEnhancing, enhanceContext, id, language, onChange]);

    const handleUndo = useCallback(() => {
        if (originalText !== null) {
            onChange(originalText);
            setOriginalText(null);
        }
    }, [originalText, onChange]);

    const canEnhance = value.trim().length >= 10 && !isEnhancing;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-text-main"
                >
                    {label}
                    {label && (required ? (
                        <span className="text-red-500 ml-1">*</span>
                    ) : (
                        <span className="text-text-muted font-normal ml-1">({t.common?.optional || 'optional'})</span>
                    ))}
                </label>
            </div>
            <div className="relative">
                {icon && (
                    <div
                        className={`absolute left-4 top-4 transition-colors ${
                            isFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        {icon}
                    </div>
                )}
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        // Clear undo if user types after enhancement
                        if (originalText !== null) setOriginalText(null);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 pb-10 rounded-xl border-2 transition-all bg-transparent resize-none ${
                        isFocused ? 'border-primary-teal' : 'border-gray-200 dark:border-gray-700'
                    } focus:outline-none text-text-main placeholder:text-text-muted/60`}
                />

                {/* AI Enhance + Undo buttons — always visible at bottom-right */}
                <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
                    {originalText !== null && (
                        <button
                            type="button"
                            onClick={handleUndo}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-sm"
                            title={wz?.undoEnhance || 'Desfazer melhoria'}
                        >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span>{wz?.undoEnhance || 'Desfazer'}</span>
                        </button>
                    )}
                    {!isEnhancing && (
                        <button
                            type="button"
                            onClick={handleEnhance}
                            disabled={!canEnhance}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
                                canEnhance
                                    ? 'text-white bg-gradient-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 hover:shadow-md cursor-pointer'
                                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                            }`}
                            title={wz?.enhanceWithAI || 'Melhorar com IA'}
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>{wz?.enhanceWithAI || 'Melhorar com IA'}</span>
                        </button>
                    )}
                    {isEnhancing && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-primary-teal to-teal-400 rounded-lg shadow-sm">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{wz?.enhancing || 'Melhorando...'}</span>
                        </div>
                    )}
                </div>
            </div>
            {helperText && (
                <p className="text-xs text-text-muted">{helperText}</p>
            )}
        </div>
    );
};

interface FormInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    icon?: React.ReactNode;
    type?: 'text' | 'email' | 'tel';
}

export const FormInput = ({
    id,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    icon,
    type = 'text',
}: FormInputProps) => {
    const { t } = useLanguage();

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-text-main"
            >
                {label}
                {required ? (
                    <span className="text-red-500 ml-1">*</span>
                ) : (
                    <span className="text-text-muted font-normal ml-1">({t.common?.optional || 'optional'})</span>
                )}
            </label>
            <div className="relative">
                {icon && (
                    <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            isFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-xl border-2 transition-all bg-transparent ${
                        isFocused ? 'border-primary-teal' : 'border-gray-200 dark:border-gray-700'
                    } focus:outline-none text-text-main placeholder:text-text-muted/60`}
                />
            </div>
        </div>
    );
};
