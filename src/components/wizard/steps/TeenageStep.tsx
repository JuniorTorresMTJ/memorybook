import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Users, Star, Rocket } from 'lucide-react';
import type { TeenageData } from '../types';
import { FormInput, FormTextArea } from '../FormTextArea';
import { UploadDropzone } from '../UploadDropzone';
import { useLanguage } from '../../../contexts/LanguageContext';

interface TeenageStepProps {
    data: TeenageData;
    onChange: (data: Partial<TeenageData>) => void;
}

export const TeenageStep = ({ data, onChange }: TeenageStepProps) => {
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">{wz?.teenage || 'Teenage Years'}</h2>
                </div>
                <p className="text-text-muted">
                    {wz?.teenageIntro || "Growing up memories. Write as little or as much as you'd like."}
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <FormInput
                    id="livingPlace"
                    label={wz?.whereLiveTeenage || "Where did they live during adolescence?"}
                    value={data.livingPlace}
                    onChange={(livingPlace) => onChange({ livingPlace })}
                    placeholder={wz?.teenLivePlaceholder || "e.g., Rio de Janeiro, in the Copacabana neighborhood"}
                    icon={<MapPin className="w-5 h-5" />}
                />

                <FormTextArea
                    id="schoolExperiences"
                    label={wz?.schoolExperiences || "School experiences"}
                    value={data.schoolExperiences}
                    onChange={(schoolExperiences) => onChange({ schoolExperiences })}
                    placeholder={wz?.schoolPlaceholder || "e.g., Favorite subjects, teachers they remember, school activities..."}
                    rows={3}
                    icon={<GraduationCap className="w-5 h-5" />}
                />

                <FormTextArea
                    id="friendsInterests"
                    label={wz?.friendsInterests || "Friends, interests, and hobbies"}
                    value={data.friendsInterests}
                    onChange={(friendsInterests) => onChange({ friendsInterests })}
                    placeholder={wz?.friendsPlaceholder || "e.g., Best friends, favorite activities, clubs or groups..."}
                    rows={3}
                    icon={<Users className="w-5 h-5" />}
                />

                <FormTextArea
                    id="memorableEvents"
                    label={wz?.memorableEvents || "Any memorable events?"}
                    value={data.memorableEvents}
                    onChange={(memorableEvents) => onChange({ memorableEvents })}
                    placeholder={wz?.eventsPlaceholder || "e.g., A graduation, first job, special trips, achievements..."}
                    rows={4}
                    icon={<Star className="w-5 h-5" />}
                />
            </div>

            {/* Photo Upload */}
            <div className="pt-4">
                <UploadDropzone
                    images={data.photos}
                    onChange={(photos) => onChange({ photos })}
                    label={wz?.addTeenagePhotos || "Add adolescence photos"}
                    helperText={wz?.teenagePhotosHelper || "School photos, with friends, or from special moments"}
                    maxImages={5}
                />
            </div>
        </motion.div>
    );
};
