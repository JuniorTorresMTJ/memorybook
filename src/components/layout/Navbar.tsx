import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { AuthModal } from '../ui/AuthModal';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import logoRound from '../../assets/logo_round.png';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleAuthClick = () => {
        setIsMobileMenuOpen(false);
        setIsAuthModalOpen(true);
    };

    return (
        <>
            <nav className={`w-full py-4 md:py-6 px-4 md:px-12 sticky top-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
                ? 'bg-gradient-to-br from-teal-50/95 to-orange-50/95 backdrop-blur-md shadow-lg'
                : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logoRound} alt="Memory Book" className="w-8 h-8" />
                        <span className="text-xl font-bold text-text-main">Memory Book</span>
                    </div>

                    {/* Desktop Navigation */}
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

                        <div className="w-px h-6 bg-gray-300 mx-2"></div>

                        <LanguageSelector />

                        <div className="w-px h-6 bg-gray-300 mx-2"></div>

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

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-text-main" />
                            ) : (
                                <Menu className="w-6 h-6 text-text-main" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="pt-4 pb-2 mt-4 border-t border-black/10 flex flex-col gap-4">
                                <a
                                    href="#how-it-works"
                                    onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                                    className="text-text-muted hover:text-primary-teal transition-colors font-medium py-2"
                                >
                                    {t.nav.howItWorks}
                                </a>
                                <a
                                    href="#privacy"
                                    onClick={(e) => handleScrollToSection(e, 'privacy')}
                                    className="text-text-muted hover:text-primary-teal transition-colors font-medium py-2"
                                >
                                    {t.nav.privacy}
                                </a>

                                <div className="h-px bg-black/10 my-2"></div>

                                <LanguageSelector variant="inline" />

                                <div className="h-px bg-black/10 my-2"></div>

                                <button
                                    onClick={handleAuthClick}
                                    className="text-text-muted hover:text-primary-teal transition-colors font-medium py-2 text-left"
                                >
                                    {t.nav.signIn}
                                </button>
                                <Button
                                    variant="primary"
                                    className="!py-3 !px-6 !text-base w-full"
                                    onClick={handleAuthClick}
                                >
                                    {t.nav.getStarted}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
};
