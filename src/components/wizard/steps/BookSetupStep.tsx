import { motion } from 'framer-motion';
import { Camera, User } from 'lucide-react';
import type { BookSetupData, ReferenceInputMode, PhysicalCharacteristicsData } from '../types';
import { PageCountSelector } from '../PageCountSelector';
import { UploadDropzone } from '../UploadDropzone';
import { StyleSelector } from '../StyleSelector';
import { TitleDateForm } from '../TitleDateForm';
import { PhysicalCharacteristics } from '../PhysicalCharacteristics';
import { useLanguage } from '../../../contexts/LanguageContext';

interface BookSetupStepProps {
    data: BookSetupData;
    onChange: (data: Partial<BookSetupData>) => void;
    errors: {
        title?: string;
        photos?: string;
    };
}

export const BookSetupStep = ({ data, onChange, errors }: BookSetupStepProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;
    const handleModeChange = (mode: ReferenceInputMode) => {
        onChange({ referenceInputMode: mode });
    };

    const handleCharacteristicsChange = (updates: Partial<PhysicalCharacteristicsData>) => {
        onChange({
            physicalCharacteristics: {
                ...data.physicalCharacteristics,
                ...updates,
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-text-main">{wz?.bookSetup || 'Configuração do Livro'}</h2>
                <p className="text-text-muted mt-2">
                    {wz?.letsStart || 'Vamos começar configurando as informações básicas do seu Memory Book.'}
                </p>
            </div>

            {/* Page Count */}
            <section>
                <PageCountSelector
                    value={data.pageCount}
                    onChange={(pageCount) => onChange({ pageCount })}
                />
            </section>

            {/* Reference Input Mode Selector */}
            <section>
                <h3 className="text-lg font-semibold text-text-main mb-2">
                    {wz?.visualReference || 'Referência Visual'}
                </h3>
                <p className="text-text-muted text-sm mb-4">
                    {wz?.visualReferenceDesc || 'Escolha como deseja nos ajudar a personalizar as ilustrações'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Photos Option */}
                    <button
                        type="button"
                        onClick={() => handleModeChange('photos')}
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                            data.referenceInputMode === 'photos'
                                ? 'border-primary-teal bg-primary-teal/5'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            data.referenceInputMode === 'photos' ? 'bg-primary-teal/20' : 'bg-gray-100'
                        }`}>
                            <Camera className={`w-7 h-7 ${
                                data.referenceInputMode === 'photos' ? 'text-primary-teal' : 'text-gray-500'
                            }`} />
                        </div>
                        <div className="text-center">
                            <h4 className={`font-semibold ${
                                data.referenceInputMode === 'photos' ? 'text-primary-teal' : 'text-gray-700'
                            }`}>
                                {wz?.uploadPhotos || 'Enviar Fotos'}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {wz?.uploadPhotosDesc || 'Mínimo 3 fotos de diferentes ângulos'}
                            </p>
                        </div>
                        {data.referenceInputMode === 'photos' && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary-teal rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>

                    {/* Characteristics Option */}
                    <button
                        type="button"
                        onClick={() => handleModeChange('characteristics')}
                        className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                            data.referenceInputMode === 'characteristics'
                                ? 'border-accent-coral bg-accent-coral/5'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            data.referenceInputMode === 'characteristics' ? 'bg-accent-coral/20' : 'bg-gray-100'
                        }`}>
                            <User className={`w-7 h-7 ${
                                data.referenceInputMode === 'characteristics' ? 'text-accent-coral' : 'text-gray-500'
                            }`} />
                        </div>
                        <div className="text-center">
                            <h4 className={`font-semibold ${
                                data.referenceInputMode === 'characteristics' ? 'text-accent-coral' : 'text-gray-700'
                            }`}>
                                {wz?.describeCharacteristics || 'Descrever Características'}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {wz?.describeCharacteristicsDesc || 'Cor do cabelo, pele, óculos, etc.'}
                            </p>
                        </div>
                        {data.referenceInputMode === 'characteristics' && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-accent-coral rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                </div>

                {/* Conditional Content Based on Mode */}
                {data.referenceInputMode === 'photos' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <UploadDropzone
                            images={data.referencePhotos}
                            onChange={(referencePhotos) => onChange({ referencePhotos })}
                            minImages={3}
                            maxImages={10}
                            label={wz?.referencePhotosLabel || "Fotos de Referência"}
                            helperText={wz?.referencePhotosHelperText || "Envie pelo menos 3 fotos claras da pessoa de diferentes ângulos. Isso nos ajuda a criar ilustrações personalizadas."}
                            showPrivacyHint
                            error={errors.photos}
                        />
                    </motion.div>
                )}

                {data.referenceInputMode === 'characteristics' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 rounded-2xl p-6"
                    >
                        <PhysicalCharacteristics
                            data={data.physicalCharacteristics}
                            onChange={handleCharacteristicsChange}
                        />
                    </motion.div>
                )}
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
