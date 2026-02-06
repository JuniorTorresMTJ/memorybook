import { motion } from 'framer-motion';
import { Sparkles, Rocket, Gem, Leaf, Zap, BookOpen } from 'lucide-react';
import type {
    MemoryBookData,
    GenerationSettings,
    ReadingLevel,
    Tone,
    WizardStep,
} from '../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ReviewStepProps {
    data: MemoryBookData;
    onEditSection: (step: WizardStep) => void;
    onSettingsChange: (settings: Partial<GenerationSettings>) => void;
    completedSteps: Set<WizardStep>;
}

export const ReviewStep = ({
    data,
    onEditSection,
    onSettingsChange,
}: ReviewStepProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    const readingLevels: { value: ReadingLevel; label: string; description: string }[] = [
        {
            value: 'very-simple',
            label: wz?.verySimple || 'Very Simple',
            description: wz?.verySimpleDesc || 'Short sentences, basic words',
        },
        {
            value: 'standard',
            label: wz?.standard || 'Standard',
            description: wz?.standardDesc || 'Natural, conversational tone',
        },
    ];

    const toneOptions: { value: Tone; label: string; emoji: string }[] = [
        { value: 'warm', label: wz?.toneWarm || 'Warm & Simple', emoji: '🌟' },
        { value: 'joyful', label: wz?.toneJoyful || 'Joyful & Celebratory', emoji: '🎉' },
        { value: 'calm', label: wz?.toneCalm || 'Calm & Reflective', emoji: '🌿' },
    ];

    const memorySections = [
        {
            key: 'childhood',
            title: wz?.childhood || 'Childhood',
            icon: <Sparkles className="w-4 h-4 text-amber-500" />,
            text: data.memories.childhood,
            bgColor: 'bg-amber-50',
        },
        {
            key: 'teenage',
            title: wz?.teenage || 'Teenage Years',
            icon: <Rocket className="w-4 h-4 text-purple-500" />,
            text: data.memories.teenage,
            bgColor: 'bg-purple-50',
        },
        {
            key: 'adultLife',
            title: wz?.adultLife || 'Adult Life',
            icon: <Gem className="w-4 h-4 text-blue-500" />,
            text: data.memories.adultLife,
            bgColor: 'bg-blue-50',
        },
        {
            key: 'laterLife',
            title: wz?.laterLife || 'Later Life',
            icon: <Leaf className="w-4 h-4 text-teal-500" />,
            text: data.memories.laterLife,
            bgColor: 'bg-teal-50',
        },
    ];

    const filledSections = memorySections.filter((s) => s.text.trim().length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-teal to-teal-400 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">{wz?.review || 'Review & Generate'}</h2>
                </div>
                <p className="text-text-muted">
                    {wz?.reviewIntro || 'Review your content and customize how your Memory Book will be created.'}
                </p>
            </div>

            {/* Book Info Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-teal/10 to-teal-400/10 border border-primary-teal/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sm text-text-muted">{wz?.bookTitle || 'Book Title'}</p>
                        <p className="text-lg font-semibold text-text-main">
                            {data.bookSetup.title || (wz?.bookTitlePlaceholder || 'Untitled Book')}
                        </p>
                        {data.bookSetup.subtitle && (
                            <p className="text-sm text-text-muted">{data.bookSetup.subtitle}</p>
                        )}
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="text-center">
                            <p className="font-semibold text-text-main">{data.bookSetup.pageCount}</p>
                            <p className="text-text-muted">{wz?.howManyPages?.split('?')[0]?.trim() || 'Pages'}</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-text-main capitalize">
                                {data.bookSetup.illustrationStyle}
                            </p>
                            <p className="text-text-muted">{wz?.illustrationStyle || 'Style'}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onEditSection(1)}
                    className="text-xs text-primary-teal hover:underline mt-2"
                >
                    {wz?.editSetup || 'Edit setup'}
                </button>
            </div>

            {/* Memory Sections Summary */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-text-main">{wz?.contentSummary || 'Content Summary'}</h3>
                    <button
                        onClick={() => onEditSection(2)}
                        className="text-xs text-primary-teal hover:underline"
                    >
                        {wz?.editMemories || 'Edit memories'}
                    </button>
                </div>
                {filledSections.length > 0 ? (
                    <div className="space-y-3">
                        {filledSections.map((section) => (
                            <div key={section.key} className={`p-3 rounded-xl ${section.bgColor} flex items-start gap-3`}>
                                {section.icon}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-main">{section.title}</p>
                                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{section.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-muted italic">
                        {wz?.noMemoriesYet || 'No memories added yet. The AI will create a generic story based on the book title.'}
                    </p>
                )}
            </div>

            {/* Generation Settings */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-teal" />
                    {wz?.generationSettings || 'Generation Settings'}
                </h3>

                {/* Reading Level */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-main">
                        {wz?.readingLevel || 'Reading Level'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {readingLevels.map((level) => (
                            <button
                                key={level.value}
                                onClick={() =>
                                    onSettingsChange({ readingLevel: level.value })
                                }
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    data.generationSettings.readingLevel === level.value
                                        ? 'border-primary-teal bg-primary-teal/5 dark:bg-primary-teal/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <p
                                    className={`font-medium ${
                                        data.generationSettings.readingLevel === level.value
                                            ? 'text-primary-teal'
                                            : 'text-text-main'
                                    }`}
                                >
                                    {level.label}
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    {level.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tone */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-main">
                        {wz?.bookTone || 'Book Tone'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {toneOptions.map((tone) => (
                            <button
                                key={tone.value}
                                onClick={() => onSettingsChange({ tone: tone.value })}
                                className={`px-4 py-2.5 rounded-full border-2 transition-all flex items-center gap-2 ${
                                    data.generationSettings.tone === tone.value
                                        ? 'border-primary-teal bg-primary-teal/10 dark:bg-primary-teal/20 text-primary-teal'
                                        : 'border-gray-200 dark:border-gray-700 text-text-main hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <span>{tone.emoji}</span>
                                <span className="font-medium text-sm">{tone.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
