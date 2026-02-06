import { motion } from 'framer-motion';
import { Briefcase, Heart, Palette, Users, Trophy, Gem } from 'lucide-react';
import type { AdultLifeData } from '../types';
import { FormTextArea } from '../FormTextArea';
import { UploadDropzone } from '../UploadDropzone';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AdultLifeStepProps {
    data: AdultLifeData;
    onChange: (data: Partial<AdultLifeData>) => void;
}

export const AdultLifeStep = ({ data, onChange }: AdultLifeStepProps) => {
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <Gem className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">{wz?.adultLife || 'Adult Life'}</h2>
                </div>
                <p className="text-text-muted">
                    {wz?.adultLifeIntro || "Career, family, and life's adventures. Write as little or as much as you'd like."}
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <FormTextArea
                    id="career"
                    label={wz?.workCareer || "Work and career"}
                    value={data.career}
                    onChange={(career) => onChange({ career })}
                    placeholder={wz?.workPlaceholder || "e.g., Where they worked, what they did, colleagues they remember..."}
                    rows={3}
                    icon={<Briefcase className="w-5 h-5" />}
                />

                <FormTextArea
                    id="hobbiesPassions"
                    label={wz?.hobbiesPassions || "Hobbies and passions"}
                    value={data.hobbiesPassions}
                    onChange={(hobbiesPassions) => onChange({ hobbiesPassions })}
                    placeholder={wz?.hobbiesPlaceholder || "e.g., Gardening, cooking, music, sports, travel..."}
                    rows={3}
                    icon={<Palette className="w-5 h-5" />}
                />

                <FormTextArea
                    id="partner"
                    label={wz?.marriagePartner || "Marriage or partner"}
                    value={data.partner}
                    onChange={(partner) => onChange({ partner })}
                    placeholder={wz?.partnerPlaceholder || "e.g., How they met, special moments together..."}
                    rows={3}
                    icon={<Heart className="w-5 h-5" />}
                />

                <FormTextArea
                    id="children"
                    label={wz?.childrenFamily || "Children and family"}
                    value={data.children}
                    onChange={(children) => onChange({ children })}
                    placeholder={wz?.childrenPlaceholder || "e.g., Names of children, favorite family activities..."}
                    rows={3}
                    icon={<Users className="w-5 h-5" />}
                />

                <FormTextArea
                    id="milestones"
                    label={wz?.milestones || "Milestones and proud moments"}
                    value={data.milestones}
                    onChange={(milestones) => onChange({ milestones })}
                    placeholder={wz?.milestonesPlaceholder || "e.g., Achievements, travels, special celebrations..."}
                    rows={4}
                    icon={<Trophy className="w-5 h-5" />}
                />
            </div>

            {/* Photo Upload */}
            <div className="pt-4">
                <UploadDropzone
                    images={data.photos}
                    onChange={(photos) => onChange({ photos })}
                    label={wz?.addAdultPhotos || "Add adult life photos"}
                    helperText={wz?.adultPhotosHelper || "Work, family, travel, or celebration photos"}
                    maxImages={5}
                />
            </div>
        </motion.div>
    );
};
