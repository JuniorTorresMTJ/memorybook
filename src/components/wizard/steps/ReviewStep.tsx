import { motion } from 'framer-motion';
import { Sparkles, Rocket, Gem, Leaf, BookOpen, Zap } from 'lucide-react';
import type {
    MemoryBookData,
    GenerationSettings,
    ReadingLevel,
    Tone,
    WizardStep,
} from '../types';
import { ReviewSummaryCard } from '../ReviewSummaryCard';

interface ReviewStepProps {
    data: MemoryBookData;
    onEditSection: (step: WizardStep) => void;
    onSettingsChange: (settings: Partial<GenerationSettings>) => void;
    completedSteps: Set<WizardStep>;
}

const readingLevels: { value: ReadingLevel; label: string; description: string }[] = [
    {
        value: 'very-simple',
        label: 'Very Simple',
        description: 'Short sentences, basic words',
    },
    {
        value: 'standard',
        label: 'Standard',
        description: 'Natural, conversational tone',
    },
];

const toneOptions: { value: Tone; label: string; emoji: string }[] = [
    { value: 'warm', label: 'Warm & Simple', emoji: '🌟' },
    { value: 'joyful', label: 'Joyful & Celebratory', emoji: '🎉' },
    { value: 'calm', label: 'Calm & Reflective', emoji: '🌿' },
];

const countFilledFields = (obj: Record<string, unknown>): number => {
    return Object.values(obj).filter((value) => {
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return false;
    }).length;
};

export const ReviewStep = ({
    data,
    onEditSection,
    onSettingsChange,
    completedSteps,
}: ReviewStepProps) => {
    const childhoodPrompts = countFilledFields({
        birthPlace: data.childhood.birthPlace,
        parents: data.childhood.parents,
        siblings: data.childhood.siblings,
        happyMemory: data.childhood.happyMemory,
        enjoyedActivities: data.childhood.enjoyedActivities,
    });

    const teenagePrompts = countFilledFields({
        livingPlace: data.teenage.livingPlace,
        schoolExperiences: data.teenage.schoolExperiences,
        friendsInterests: data.teenage.friendsInterests,
        memorableEvents: data.teenage.memorableEvents,
    });

    const adultPrompts = countFilledFields({
        career: data.adultLife.career,
        hobbiesPassions: data.adultLife.hobbiesPassions,
        partner: data.adultLife.partner,
        children: data.adultLife.children,
        milestones: data.adultLife.milestones,
    });

    const laterLifePrompts = countFilledFields({
        livingPlace: data.laterLife.livingPlace,
        routinesTraditions: data.laterLife.routinesTraditions,
        familyMoments: data.laterLife.familyMoments,
        comfortJoy: data.laterLife.comfortJoy,
    });

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
                    <h2 className="text-2xl font-bold text-text-main">Review & Generate</h2>
                </div>
                <p className="text-text-muted">
                    Review your content and customize how your Memory Book will be created.
                </p>
            </div>

            {/* Book Info Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-teal/10 to-teal-400/10 border border-primary-teal/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-sm text-text-muted">Book Title</p>
                        <p className="text-lg font-semibold text-text-main">
                            {data.bookSetup.title || 'Untitled Book'}
                        </p>
                        {data.bookSetup.subtitle && (
                            <p className="text-sm text-text-muted">{data.bookSetup.subtitle}</p>
                        )}
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="text-center">
                            <p className="font-semibold text-text-main">{data.bookSetup.pageCount}</p>
                            <p className="text-text-muted">Pages</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-text-main capitalize">
                                {data.bookSetup.illustrationStyle}
                            </p>
                            <p className="text-text-muted">Style</p>
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-text-main">
                                {data.bookSetup.referencePhotos.length}
                            </p>
                            <p className="text-text-muted">Photos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Summaries */}
            <div>
                <h3 className="text-lg font-semibold text-text-main mb-4">Content Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReviewSummaryCard
                        title="Childhood"
                        icon={<Sparkles className="w-5 h-5 text-white" />}
                        gradient="from-amber-400 to-orange-500"
                        promptsAnswered={childhoodPrompts}
                        totalPrompts={5}
                        imagesAdded={data.childhood.photos.length}
                        onEdit={() => onEditSection(2)}
                        isSkipped={!completedSteps.has(2) && childhoodPrompts === 0}
                    />
                    <ReviewSummaryCard
                        title="Teenage Years"
                        icon={<Rocket className="w-5 h-5 text-white" />}
                        gradient="from-purple-400 to-pink-500"
                        promptsAnswered={teenagePrompts}
                        totalPrompts={4}
                        imagesAdded={data.teenage.photos.length}
                        onEdit={() => onEditSection(3)}
                        isSkipped={!completedSteps.has(3) && teenagePrompts === 0}
                    />
                    <ReviewSummaryCard
                        title="Adult Life"
                        icon={<Gem className="w-5 h-5 text-white" />}
                        gradient="from-blue-400 to-indigo-500"
                        promptsAnswered={adultPrompts}
                        totalPrompts={5}
                        imagesAdded={data.adultLife.photos.length}
                        onEdit={() => onEditSection(4)}
                        isSkipped={!completedSteps.has(4) && adultPrompts === 0}
                    />
                    <ReviewSummaryCard
                        title="Later Life"
                        icon={<Leaf className="w-5 h-5 text-white" />}
                        gradient="from-teal-400 to-green-500"
                        promptsAnswered={laterLifePrompts}
                        totalPrompts={4}
                        imagesAdded={data.laterLife.photos.length}
                        onEdit={() => onEditSection(5)}
                        isSkipped={!completedSteps.has(5) && laterLifePrompts === 0}
                    />
                </div>
            </div>

            {/* Generation Settings */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-teal" />
                    Generation Settings
                </h3>

                {/* Reading Level */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-main">
                        Reading Level
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
                        Book Tone
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
