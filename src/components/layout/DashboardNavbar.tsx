import { useState } from 'react';
import { Search, Plus, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { CreateMemoryBookModal } from '../wizard';
import { ProfileSidebar } from '../ui/ProfileSidebar';
import { Link } from 'react-router-dom';
import logoRound from '../../assets/logo_round.png';

interface DashboardNavbarProps {
    userName?: string;
    userAvatar?: string;
    userEmail?: string;
    onAddMemory?: (memory: { title: string; date: string; description: string; image: File | null }) => void;
}

export const DashboardNavbar = ({ userName = "Maria", userAvatar, userEmail = "maria@example.com" }: DashboardNavbarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCreateBookModalOpen, setIsCreateBookModalOpen] = useState(false);
    const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

    return (
        <>
            <nav className="w-full py-4 px-4 md:px-8 bg-card-bg border-b border-black/5 dark:border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
                        <img src={logoRound} alt="Memory Book" className="w-8 h-8" />
                        <span className="text-xl font-bold text-text-main">Memory Book</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Create Book Button */}
                        <button 
                            onClick={() => setIsCreateBookModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] text-white rounded-xl font-semibold hover:from-[#00d4d4] hover:to-[#ff8f80] transition-all shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Book</span>
                        </button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Avatar */}
                        <button 
                            onClick={() => setIsProfileSidebarOpen(true)}
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-teal/30 hover:border-primary-teal transition-colors"
                        >
                            {userAvatar ? (
                                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-teal to-accent-coral flex items-center justify-center text-white font-bold">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-text-main" />
                            ) : (
                                <Menu className="w-6 h-6 text-text-main" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search memories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30"
                            />
                        </div>
                    </div>
                )}
            </nav>

            {/* Create Memory Book Modal */}
            <CreateMemoryBookModal
                isOpen={isCreateBookModalOpen}
                onClose={() => setIsCreateBookModalOpen(false)}
                onComplete={(data) => {
                    console.log('Memory Book created:', data);
                    setIsCreateBookModalOpen(false);
                }}
            />

            {/* Profile Sidebar */}
            <ProfileSidebar
                isOpen={isProfileSidebarOpen}
                onClose={() => setIsProfileSidebarOpen(false)}
                user={{
                    name: userName,
                    email: userEmail,
                    avatar: userAvatar,
                }}
            />
        </>
    );
};
