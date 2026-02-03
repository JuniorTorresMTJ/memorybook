import { useState } from 'react';
import { Calendar, Type, FileText } from 'lucide-react';

interface TitleDateFormProps {
    title: string;
    subtitle: string;
    date: string;
    onTitleChange: (value: string) => void;
    onSubtitleChange: (value: string) => void;
    onDateChange: (value: string) => void;
    titleError?: string;
}

export const TitleDateForm = ({
    title,
    subtitle,
    date,
    onTitleChange,
    onSubtitleChange,
    onDateChange,
    titleError,
}: TitleDateFormProps) => {
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isSubtitleFocused, setIsSubtitleFocused] = useState(false);
    const [isDateFocused, setIsDateFocused] = useState(false);

    return (
        <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
                <label
                    htmlFor="book-title"
                    className="block text-sm font-medium text-text-main"
                >
                    Book Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            isTitleFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        <Type className="w-5 h-5" />
                    </div>
                    <input
                        id="book-title"
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        onFocus={() => setIsTitleFocused(true)}
                        onBlur={() => setIsTitleFocused(false)}
                        placeholder="e.g., Maria's Memory Book"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all bg-transparent ${
                            titleError
                                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500'
                                : isTitleFocused
                                ? 'border-primary-teal'
                                : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-text-main placeholder:text-text-muted/60`}
                    />
                </div>
                {titleError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{titleError}</p>
                )}
            </div>

            {/* Subtitle (Optional) */}
            <div className="space-y-2">
                <label
                    htmlFor="book-subtitle"
                    className="block text-sm font-medium text-text-main"
                >
                    Subtitle{' '}
                    <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <div className="relative">
                    <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            isSubtitleFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        <FileText className="w-5 h-5" />
                    </div>
                    <input
                        id="book-subtitle"
                        type="text"
                        value={subtitle}
                        onChange={(e) => onSubtitleChange(e.target.value)}
                        onFocus={() => setIsSubtitleFocused(true)}
                        onBlur={() => setIsSubtitleFocused(false)}
                        placeholder="e.g., A journey through cherished moments"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all bg-transparent ${
                            isSubtitleFocused ? 'border-primary-teal' : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-text-main placeholder:text-text-muted/60`}
                    />
                </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <label
                    htmlFor="book-date"
                    className="block text-sm font-medium text-text-main"
                >
                    Creation Date
                </label>
                <div className="relative">
                    <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                            isDateFocused ? 'text-primary-teal' : 'text-text-muted'
                        }`}
                    >
                        <Calendar className="w-5 h-5" />
                    </div>
                    <input
                        id="book-date"
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        onFocus={() => setIsDateFocused(true)}
                        onBlur={() => setIsDateFocused(false)}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all bg-transparent ${
                            isDateFocused ? 'border-primary-teal' : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-text-main`}
                    />
                </div>
            </div>
        </div>
    );
};
