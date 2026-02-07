import { motion } from 'framer-motion';
import { Sparkles, Rocket, Gem, Leaf, BookHeart } from 'lucide-react';
import type { MemoriesData } from '../types';
import { FormTextArea } from '../FormTextArea';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MemoriesStepProps {
    data: MemoriesData;
    onChange: (data: Partial<MemoriesData>) => void;
}

export const MemoriesStep = ({ data, onChange }: MemoriesStepProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

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
                        <BookHeart className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">
                        {wz?.memoriesTitle || 'Share Their Memories'}
                    </h2>
                </div>
                <p className="text-text-muted">
                    {wz?.memoriesIntro || "Write freely about each phase of their life. A few sentences is enough — the AI will create a beautiful story from your words."}
                </p>
            </div>

            {/* Simplified fields - one per life phase */}
            <div className="space-y-6">
                {/* Childhood */}
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-text-main">{wz?.childhood || 'Childhood'}</h3>
                        <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'optional'}</span>
                    </div>
                    <FormTextArea
                        id="memories-childhood"
                        label=""
                        value={data.childhood}
                        onChange={(childhood) => onChange({ childhood })}
                        placeholder={wz?.childhoodMemoriesPlaceholder || "Where were they born? Parents, siblings, happy memories, what they loved doing..."}
                        rows={3}
                        enhanceContext="childhood"
                    />
                </div>

                {/* Teenage */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Rocket className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-text-main">{wz?.teenage || 'Teenage Years'}</h3>
                        <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'optional'}</span>
                    </div>
                    <FormTextArea
                        id="memories-teenage"
                        label=""
                        value={data.teenage}
                        onChange={(teenage) => onChange({ teenage })}
                        placeholder={wz?.teenageMemoriesPlaceholder || "School, friends, hobbies, memorable events, where they lived..."}
                        rows={3}
                        enhanceContext="teenage"
                    />
                </div>

                {/* Adult Life */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Gem className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-text-main">{wz?.adultLife || 'Adult Life'}</h3>
                        <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'optional'}</span>
                    </div>
                    <FormTextArea
                        id="memories-adult"
                        label=""
                        value={data.adultLife}
                        onChange={(adultLife) => onChange({ adultLife })}
                        placeholder={wz?.adultMemoriesPlaceholder || "Career, partner, children, hobbies, milestones, proud moments..."}
                        rows={3}
                        enhanceContext="adultLife"
                    />
                </div>

                {/* Later Life */}
                <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Leaf className="w-5 h-5 text-teal-500" />
                        <h3 className="font-semibold text-text-main">{wz?.laterLife || 'Later Life'}</h3>
                        <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'optional'}</span>
                    </div>
                    <FormTextArea
                        id="memories-later"
                        label=""
                        value={data.laterLife}
                        onChange={(laterLife) => onChange({ laterLife })}
                        placeholder={wz?.laterMemoriesPlaceholder || "Routines, traditions, family moments, what brings them comfort and joy today..."}
                        rows={3}
                        enhanceContext="laterLife"
                    />
                </div>
            </div>

            {/* Tip */}
            <p className="text-sm text-text-muted text-center italic">
                {wz?.memoriesTip || "Don't worry about writing perfectly — our AI will transform your words into a beautiful narrative."}
            </p>
        </motion.div>
    );
};
