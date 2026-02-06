import { useState, useEffect } from 'react';
import { Search, Plus, Menu, X, User, Settings, LogOut, Heart, BookOpen, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateMemoryBookModal } from '../wizard';
import { ProfileSidebar } from '../ui/ProfileSidebar';
import { LanguageSelector } from '../ui/LanguageSelector';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { signOutUser } from '../../lib/firebase/auth';
import logoRound from '../../assets/logo_round.png';

interface DashboardNavbarProps {
    userName?: string;
    userAvatar?: string;
    userEmail?: string;
    onAddMemory?: (memory: { title: string; date: string; description: string; image: File | null }) => void;
    onSuccess?: (bookTitle: string) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export const DashboardNavbar = ({ userName = "Guest", userAvatar, userEmail = "guest@guest.com", onSuccess, searchQuery: externalSearchQuery, onSearchChange }: DashboardNavbarProps) => {
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const searchQuery = externalSearchQuery ?? internalSearchQuery;
    const handleSearchChange = (value: string) => {
        if (onSearchChange) {
            onSearchChange(value);
        } else {
            setInternalSearchQuery(value);
        }
    };
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCreateBookModalOpen, setIsCreateBookModalOpen] = useState(false);
    const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();
    const nav = t.navbar;
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        try {
            await signOutUser();
            setIsMobileMenuOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const displayName = user?.displayName || userName;
    const displayEmail = user?.email || userEmail;
    const displayAvatar = user?.photoURL || userAvatar;

    return (
        <>
            <nav className="w-full py-4 px-4 md:px-8 bg-card-bg border-b border-black/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
                        <img src={logoRound} alt="Memory Book" className="w-8 h-8" />
                        <span className="text-xl font-bold text-text-main hidden sm:inline">Memory Book</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder={nav?.searchPlaceholder || "Buscar memórias..."}
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-bg-soft rounded-xl border border-black/5 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions - Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Create Book Button */}
                        <button 
                            onClick={() => setIsCreateBookModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] text-white rounded-xl font-semibold hover:from-[#00d4d4] hover:to-[#ff8f80] transition-all shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{nav?.createBook || 'Criar Livro'}</span>
                        </button>

                        {/* User Avatar + Name + Settings */}
                        <button 
                            onClick={() => setIsProfileSidebarOpen(true)}
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-teal/30 hover:border-primary-teal transition-colors shrink-0">
                                {displayAvatar ? (
                                    <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-teal to-accent-coral flex items-center justify-center text-white font-bold">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="hidden lg:flex flex-col items-start max-w-[120px]">
                                <span className="text-sm font-medium text-text-main truncate w-full">
                                    {displayName}
                                </span>
                                <span className="text-[11px] font-light text-text-muted/70 truncate w-full">
                                    {nav?.settings || 'Settings'}
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Create Book Button - Mobile */}
                        <button 
                            onClick={() => setIsCreateBookModalOpen(true)}
                            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] text-white rounded-xl shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                            aria-label="Menu"
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
                            <div className="pt-4 mt-4 border-t border-black/10">
                                {/* User Info */}
                                <div className="flex items-center gap-3 px-2 py-3 mb-4 bg-bg-soft rounded-xl">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-teal/30 shrink-0">
                                        {displayAvatar ? (
                                            <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary-teal to-accent-coral flex items-center justify-center text-white font-bold text-lg">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-text-main truncate">{displayName}</p>
                                        <p className="text-sm text-text-muted truncate">{displayEmail}</p>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative w-full mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder={nav?.searchPlaceholder || "Buscar memórias..."}
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-bg-soft rounded-xl border border-black/5 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30"
                                    />
                                </div>

                                {/* Menu Items */}
                                <div className="flex flex-col gap-1">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-soft transition-colors text-text-main"
                                    >
                                        <BookOpen className="w-5 h-5 text-primary-teal" />
                                        <span className="font-medium">{nav?.myBooks || 'Meus Livros'}</span>
                                    </Link>
                                    
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            // TODO: Navigate to favorites
                                        }}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-soft transition-colors text-text-main w-full text-left"
                                    >
                                        <Heart className="w-5 h-5 text-accent-coral" />
                                        <span className="font-medium">{nav?.favorites || 'Favoritos'}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsProfileSidebarOpen(true);
                                        }}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-soft transition-colors text-text-main w-full text-left"
                                    >
                                        <User className="w-5 h-5 text-text-muted" />
                                        <span className="font-medium">{nav?.myProfile || 'Meu Perfil'}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            // TODO: Navigate to settings
                                        }}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-soft transition-colors text-text-main w-full text-left"
                                    >
                                        <Settings className="w-5 h-5 text-text-muted" />
                                        <span className="font-medium">{nav?.settings || 'Configurações'}</span>
                                    </button>
                                </div>

                                <div className="h-px bg-black/10 my-3"></div>

                                {/* Language Selector */}
                                <div className="px-1 py-2">
                                    <div className="flex items-center gap-3 px-2 mb-3 text-text-muted">
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm font-medium">{nav?.language || 'Idioma'}</span>
                                    </div>
                                    <LanguageSelector variant="inline" />
                                </div>

                                <div className="h-px bg-black/10 my-3"></div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-600 w-full text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">{nav?.logout || 'Sair'}</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Create Memory Book Modal */}
            <CreateMemoryBookModal
                isOpen={isCreateBookModalOpen}
                onClose={() => setIsCreateBookModalOpen(false)}
                onComplete={(data) => {
                    console.log('Memory Book created:', data);
                    setIsCreateBookModalOpen(false);
                }}
                onSuccess={onSuccess}
            />

            {/* Profile Sidebar */}
            <ProfileSidebar
                isOpen={isProfileSidebarOpen}
                onClose={() => setIsProfileSidebarOpen(false)}
                user={{
                    name: displayName,
                    email: displayEmail,
                    avatar: displayAvatar,
                }}
            />
        </>
    );
};
