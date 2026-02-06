import { useState } from 'react';
import logoRound from '../../assets/logo_round.png';
import { InfoModal } from '../ui/InfoModal';
import { useLanguage } from '../../contexts/LanguageContext';

type InfoType = 'privacy' | 'accessibility' | 'support';

export const Footer = () => {
    const [modalType, setModalType] = useState<InfoType | null>(null);
    const { t } = useLanguage();
    const ft = t.footer;

    return (
        <>
            <footer className="w-full py-12 px-4 md:px-12 bg-bg-soft border-t border-black/5 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <img src={logoRound} alt="Memory Book" className="w-6 h-6" />
                        <span className="font-bold text-text-main">Memory Book</span>
                    </div>

                    <div className="flex gap-8 text-sm text-text-muted">
                        <button onClick={() => setModalType('privacy')} className="hover:text-primary-teal transition-colors">
                            {ft?.privacyPolicy || 'Privacy Policy'}
                        </button>
                        <button onClick={() => setModalType('accessibility')} className="hover:text-primary-teal transition-colors">
                            {t.infoModals?.accessibility?.title || 'Accessibility'}
                        </button>
                        <button onClick={() => setModalType('support')} className="hover:text-primary-teal transition-colors">
                            {ft?.helpCenter || 'Help Center'}
                        </button>
                        <a href="mailto:contact@memorybook.app" className="hover:text-primary-teal transition-colors">
                            {ft?.contact || 'Contact'}
                        </a>
                    </div>

                    <div className="text-sm text-text-muted">
                        {ft?.copyright || '© 2024 Memory Book. All rights reserved.'}
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
