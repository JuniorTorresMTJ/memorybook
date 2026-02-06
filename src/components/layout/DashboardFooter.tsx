import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoRound from '../../assets/logo_round.png';
import { InfoModal } from '../ui/InfoModal';
import { useLanguage } from '../../contexts/LanguageContext';

type InfoType = 'privacy' | 'accessibility' | 'support';

export const DashboardFooter = () => {
    const [modalType, setModalType] = useState<InfoType | null>(null);
    const { t } = useLanguage();
    const ft = t.footer;

    return (
        <>
            <footer className="w-full py-6 px-4 md:px-8 bg-card-bg border-t border-black/5 dark:border-white/10 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img src={logoRound} alt="Memory Book" className="w-6 h-6" />
                        <span className="font-bold text-text-main">Memory Book</span>
                    </Link>

                    {/* Copyright */}
                    <p className="text-sm text-text-muted">
                        {ft?.copyright || '© 2024 Memory Book. All rights reserved.'}
                    </p>

                    {/* Links */}
                    <div className="flex gap-6 text-sm">
                        <button onClick={() => setModalType('privacy')} className="text-text-muted hover:text-primary-teal transition-colors">
                            {ft?.privacyPolicy || 'Privacy'}
                        </button>
                        <button onClick={() => setModalType('accessibility')} className="text-text-muted hover:text-primary-teal transition-colors">
                            {t.infoModals?.accessibility?.title || 'Accessibility'}
                        </button>
                        <button onClick={() => setModalType('support')} className="text-text-muted hover:text-primary-teal transition-colors">
                            {t.infoModals?.support?.title || 'Support'}
                        </button>
                    </div>
                </div>
            </footer>

            {modalType && (
                <InfoModal
                    isOpen={!!modalType}
                    onClose={() => setModalType(null)}
                    type={modalType}
                />
            )}
        </>
    );
};
