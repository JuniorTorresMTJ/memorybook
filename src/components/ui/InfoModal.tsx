import { X, Shield, Accessibility, HeadphonesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

type InfoType = 'privacy' | 'accessibility' | 'support';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: InfoType;
}

const icons: Record<InfoType, React.ReactNode> = {
    privacy: <Shield className="w-7 h-7 text-primary-teal" />,
    accessibility: <Accessibility className="w-7 h-7 text-accent-coral" />,
    support: <HeadphonesIcon className="w-7 h-7 text-accent-amber" />,
};

const colors: Record<InfoType, string> = {
    privacy: 'from-primary-teal/20 to-primary-teal/5',
    accessibility: 'from-accent-coral/20 to-accent-coral/5',
    support: 'from-accent-amber/20 to-accent-amber/5',
};

export const InfoModal = ({ isOpen, onClose, type }: InfoModalProps) => {
    const { t } = useLanguage();
    const info = t.infoModals;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const content = info?.[type];
    const title = content?.title || type;
    const sections: { heading: string; body: string }[] = content?.sections || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-coral/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-teal/20 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
                    </motion.div>

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={`p-6 pb-4 bg-gradient-to-b ${colors[type]} shrink-0`}>
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
                                        {icons[type]}
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-main">{title}</h2>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                {sections.map((section, i) => (
                                    <div key={i}>
                                        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">
                                            {section.heading}
                                        </h3>
                                        <p className="text-text-muted text-sm leading-relaxed">
                                            {section.body}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 shrink-0">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-text-main font-semibold rounded-xl transition-colors text-sm"
                                >
                                    {info?.close || 'Fechar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
