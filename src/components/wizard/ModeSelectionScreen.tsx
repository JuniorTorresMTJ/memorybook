import { motion } from 'framer-motion';
import { BookOpen, FileText, Mic } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type WizardMode = 'brief' | 'detailed';

interface ModeSelectionScreenProps {
    onSelect: (mode: WizardMode) => void;
}

export const ModeSelectionScreen = ({ onSelect }: ModeSelectionScreenProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    const modes = [
        {
            id: 'detailed' as const,
            icon: <BookOpen className="w-7 h-7" />,
            title: wz?.modeDetailedTitle || 'Descrever a história',
            description: wz?.modeDetailedDesc || 'Conte com detalhes cada fase da vida — infância, juventude, vida adulta e momento atual. Quanto mais detalhes, mais especial será o livro.',
            color: 'from-primary-teal to-teal-400',
            bgColor: 'bg-primary-teal/5 border-primary-teal/20 hover:border-primary-teal/40',
            iconBg: 'bg-primary-teal/10 text-primary-teal',
            enabled: true,
        },
        {
            id: 'brief' as const,
            icon: <FileText className="w-7 h-7" />,
            title: wz?.modeBriefTitle || 'Versão mais breve',
            description: wz?.modeBriefDesc || 'Escreva livremente sobre cada fase em um campo de texto. Ideal para quando você quer algo rápido e simples.',
            color: 'from-blue-500 to-blue-400',
            bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-300',
            iconBg: 'bg-blue-100 text-blue-600',
            enabled: true,
        },
        {
            id: 'audio' as const,
            icon: <Mic className="w-7 h-7" />,
            title: wz?.modeAudioTitle || 'Descrever por áudio',
            description: wz?.modeAudioDesc || 'Grave sua voz contando as memórias e a IA transcreve automaticamente.',
            color: 'from-gray-400 to-gray-300',
            bgColor: 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed',
            iconBg: 'bg-gray-100 text-gray-400',
            enabled: false,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-main mb-2">
                    {wz?.modeSelectionTitle || 'Como deseja criar seu livro?'}
                </h2>
                <p className="text-text-muted max-w-md mx-auto">
                    {wz?.modeSelectionDesc || 'Escolha a forma que preferir para contar as memórias. Você poderá mudar depois.'}
                </p>
            </div>

            {/* Mode Cards */}
            <div className="space-y-4 max-w-lg mx-auto">
                {modes.map((mode, index) => (
                    <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => mode.enabled && onSelect(mode.id as WizardMode)}
                        disabled={!mode.enabled}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${mode.bgColor} ${
                            mode.enabled ? 'cursor-pointer' : ''
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mode.iconBg}`}>
                                {mode.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-text-main text-lg">{mode.title}</h3>
                                    {!mode.enabled && (
                                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                            {wz?.comingSoon || 'Em breve'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-muted mt-1">{mode.description}</p>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
