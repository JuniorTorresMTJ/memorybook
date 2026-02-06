import { motion } from 'framer-motion';
import { MapPin, Users, Heart, Smile, Sparkles } from 'lucide-react';
import type { ChildhoodData } from '../types';
import { FormInput, FormTextArea } from '../FormTextArea';
import { UploadDropzone } from '../UploadDropzone';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ChildhoodStepProps {
    data: ChildhoodData;
    onChange: (data: Partial<ChildhoodData>) => void;
}

export const ChildhoodStep = ({ data, onChange }: ChildhoodStepProps) => {
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">{wz?.childhood || 'Childhood'}</h2>
                </div>
                <p className="text-text-muted">
                    {wz?.childhoodIntro || "Tell us about their early years. Write as little or as much as you'd like."}
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <FormInput
                    id="birthPlace"
                    label={wz?.whereBorn || "Where were they born?"}
                    value={data.birthPlace}
                    onChange={(birthPlace) => onChange({ birthPlace })}
                    placeholder={wz?.birthPlacePlaceholder || "e.g., São Paulo, Brazil"}
                    icon={<MapPin className="w-5 h-5" />}
                />

                <FormInput
                    id="parents"
                    label={wz?.whoParents || "Who were their parents?"}
                    value={data.parents}
                    onChange={(parents) => onChange({ parents })}
                    placeholder={wz?.parentsPlaceholder || "e.g., João and Maria Silva"}
                    icon={<Users className="w-5 h-5" />}
                />

                <FormInput
                    id="siblings"
                    label={wz?.siblings || "Did they have siblings?"}
                    value={data.siblings}
                    onChange={(siblings) => onChange({ siblings })}
                    placeholder={wz?.siblingsPlaceholder || "e.g., Two brothers, Pedro and Paulo"}
                    icon={<Users className="w-5 h-5" />}
                />

                <FormTextArea
                    id="happyMemory"
                    label={wz?.happyMemory || "A happy childhood memory"}
                    value={data.happyMemory}
                    onChange={(happyMemory) => onChange({ happyMemory })}
                    placeholder={wz?.happyMemoryPlaceholder || "Share a warm memory from their childhood..."}
                    rows={4}
                    icon={<Heart className="w-5 h-5" />}
                />

                <FormTextArea
                    id="enjoyedActivities"
                    label={wz?.whatEnjoy || "What did they enjoy doing?"}
                    value={data.enjoyedActivities}
                    onChange={(enjoyedActivities) => onChange({ enjoyedActivities })}
                    placeholder={wz?.enjoyedPlaceholder || "e.g., Playing in the garden, reading books, helping in the kitchen..."}
                    rows={3}
                    icon={<Smile className="w-5 h-5" />}
                />
            </div>

            {/* Photo Upload */}
            <div className="pt-4">
                <UploadDropzone
                    images={data.photos}
                    onChange={(photos) => onChange({ photos })}
                    label={wz?.addChildhoodPhotos || "Add childhood photos"}
                    helperText={wz?.childhoodPhotosHelper || "Old family photos help us capture their early years"}
                    maxImages={5}
                />
            </div>
        </motion.div>
    );
};
