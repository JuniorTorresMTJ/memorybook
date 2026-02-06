import { motion } from 'framer-motion';
import { Home, Heart, Users, Sun, Leaf } from 'lucide-react';
import type { LaterLifeData } from '../types';
import { FormInput, FormTextArea } from '../FormTextArea';
import { UploadDropzone } from '../UploadDropzone';
import { useLanguage } from '../../../contexts/LanguageContext';

interface LaterLifeStepProps {
    data: LaterLifeData;
    onChange: (data: Partial<LaterLifeData>) => void;
}

export const LaterLifeStep = ({ data, onChange }: LaterLifeStepProps) => {
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">{wz?.laterLife || 'Later Life'}</h2>
                </div>
                <p className="text-text-muted">
                    {wz?.laterLifeIntro || "The golden years and present day. Write as little or as much as you'd like."}
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <FormInput
                    id="laterLivingPlace"
                    label={wz?.whereLiveLater || "Where did they live later in life?"}
                    value={data.livingPlace}
                    onChange={(livingPlace) => onChange({ livingPlace })}
                    placeholder={wz?.laterLivePlaceholder || "e.g., Same house for 40 years, moved to be closer to family..."}
                    icon={<Home className="w-5 h-5" />}
                />

                <FormTextArea
                    id="routinesTraditions"
                    label={wz?.routinesTraditions || "Favorite routines, traditions, and places"}
                    value={data.routinesTraditions}
                    onChange={(routinesTraditions) => onChange({ routinesTraditions })}
                    placeholder={wz?.routinesPlaceholder || "e.g., Morning coffee ritual, Sunday lunches, favorite park bench..."}
                    rows={3}
                    icon={<Sun className="w-5 h-5" />}
                />

                <FormTextArea
                    id="familyMoments"
                    label={wz?.familyMoments || "Family moments"}
                    value={data.familyMoments}
                    onChange={(familyMoments) => onChange({ familyMoments })}
                    placeholder={wz?.familyMomentsPlaceholder || "e.g., Time with grandchildren, family gatherings, celebrations..."}
                    rows={3}
                    icon={<Users className="w-5 h-5" />}
                />

                <FormTextArea
                    id="comfortJoy"
                    label={wz?.comfortJoy || "What brings them comfort and joy today?"}
                    value={data.comfortJoy}
                    onChange={(comfortJoy) => onChange({ comfortJoy })}
                    placeholder={wz?.comfortPlaceholder || "e.g., Listening to old songs, looking at photos, visits from loved ones..."}
                    rows={4}
                    icon={<Heart className="w-5 h-5" />}
                />
            </div>

            {/* Photo Upload */}
            <div className="pt-4">
                <UploadDropzone
                    images={data.photos}
                    onChange={(photos) => onChange({ photos })}
                    label={wz?.addLaterPhotos || "Add later life photos"}
                    helperText={wz?.laterPhotosHelper || "Recent photos or from recent years"}
                    maxImages={5}
                />
            </div>
        </motion.div>
    );
};
