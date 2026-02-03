import { motion } from 'framer-motion';
import type { BookSetupData } from '../types';
import { PageCountSelector } from '../PageCountSelector';
import { UploadDropzone } from '../UploadDropzone';
import { StyleSelector } from '../StyleSelector';
import { TitleDateForm } from '../TitleDateForm';

interface BookSetupStepProps {
    data: BookSetupData;
    onChange: (data: Partial<BookSetupData>) => void;
    errors: {
        title?: string;
        photos?: string;
    };
}

export const BookSetupStep = ({ data, onChange, errors }: BookSetupStepProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-text-main">Book Setup</h2>
                <p className="text-text-muted mt-2">
                    Let's start by setting up the basics for your Memory Book.
                </p>
            </div>

            {/* Page Count */}
            <section>
                <PageCountSelector
                    value={data.pageCount}
                    onChange={(pageCount) => onChange({ pageCount })}
                />
            </section>

            {/* Reference Photos */}
            <section>
                <UploadDropzone
                    images={data.referencePhotos}
                    onChange={(referencePhotos) => onChange({ referencePhotos })}
                    minImages={3}
                    maxImages={10}
                    label="Reference Photos"
                    helperText="Upload clear photos of your loved one from different angles. These help us create personalized illustrations."
                    showPrivacyHint
                    required
                    error={errors.photos}
                />
            </section>

            {/* Illustration Style */}
            <section>
                <StyleSelector
                    value={data.illustrationStyle}
                    onChange={(illustrationStyle) => onChange({ illustrationStyle })}
                />
            </section>

            {/* Title & Date */}
            <section>
                <TitleDateForm
                    title={data.title}
                    subtitle={data.subtitle}
                    date={data.date}
                    onTitleChange={(title) => onChange({ title })}
                    onSubtitleChange={(subtitle) => onChange({ subtitle })}
                    onDateChange={(date) => onChange({ date })}
                    titleError={errors.title}
                />
            </section>
        </motion.div>
    );
};
