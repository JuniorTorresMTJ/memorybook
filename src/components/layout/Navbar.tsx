import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { AuthModal } from '../ui/AuthModal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import logoRound from '../../assets/logo_round.png';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            <nav className={`w-full py-6 px-4 md:px-12 sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-gradient-to-br from-teal-50/95 to-orange-50/95 backdrop-blur-md shadow-lg'
                : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logoRound} alt="Memory Book" className="w-8 h-8" />
                        <span className="text-xl font-bold text-text-main">Memory Book</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <a
                            href="#how-it-works"
                            onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                            className="text-text-muted hover:text-primary-teal transition-colors font-medium cursor-pointer"
                        >
                            {t.nav.howItWorks}
                        </a>
                        <a
                            href="#privacy"
                            onClick={(e) => handleScrollToSection(e, 'privacy')}
                            className="text-text-muted hover:text-primary-teal transition-colors font-medium cursor-pointer"
                        >
                            {t.nav.privacy}
                        </a>

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

                        <ThemeToggle />
                        <LanguageSelector />

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="text-text-muted hover:text-primary-teal transition-colors font-medium"
                        >
                            {t.nav.signIn}
                        </button>
                        <Button
                            variant="primary"
                            className="!py-2 !px-6 !text-base"
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            {t.nav.getStarted}
                        </Button>
                    </div>
                </div>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};
