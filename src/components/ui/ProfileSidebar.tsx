import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Mail, Phone, Camera, Lock, LogOut, ChevronRight, Save, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { languages } from '../../constants/translations';
import type { LanguageCode } from '../../constants/translations';

interface ProfileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user?: {
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
}

export const ProfileSidebar = ({ isOpen, onClose, user }: ProfileSidebarProps) => {
    const [activeSection, setActiveSection] = useState<'menu' | 'personal' | 'photo' | 'password' | 'language'>('menu');
    const [name, setName] = useState(user?.name || 'Maria Silva');
    const [email, setEmail] = useState(user?.email || 'maria@example.com');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { language, setLanguage, t } = useLanguage();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            onClose();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClose = () => {
        setActiveSection('menu');
        onClose();
    };

    const menuItems = [
        {
            id: 'personal',
            icon: User,
            label: t.profile?.personalInfo || 'Personal Information',
            description: t.profile?.personalInfoDesc || 'Update your name, email and phone',
        },
        {
            id: 'photo',
            icon: Camera,
            label: t.profile?.profilePhoto || 'Profile Photo',
            description: t.profile?.profilePhotoDesc || 'Change your profile picture',
        },
        {
            id: 'password',
            icon: Lock,
            label: t.profile?.changePassword || 'Change Password',
            description: t.profile?.changePasswordDesc || 'Update your password',
        },
        {
            id: 'language',
            icon: Globe,
            label: t.profile?.language || 'Language',
            description: t.profile?.languageDesc || 'Choose your preferred language',
        },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'personal':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                {t.profile?.fullName || 'Full Name'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                {t.profile?.email || 'Email'}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                {t.profile?.phone || 'Phone (optional)'}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-11 pr-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                />
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-teal text-white rounded-xl font-semibold hover:bg-primary-teal/90 transition-colors">
                            <Save className="w-4 h-4" />
                            {t.profile?.saveChanges || 'Save Changes'}
                        </button>
                    </div>
                );

            case 'photo':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-teal/20">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-teal to-accent-coral flex items-center justify-center text-white text-4xl font-bold">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-teal rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-teal/90 transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <p className="mt-4 text-text-muted text-sm text-center">
                                {t.profile?.clickToUpload || 'Click the camera icon to upload a new photo'}
                            </p>
                        </div>

                        <div className="bg-bg-soft rounded-xl p-4">
                            <h4 className="font-medium text-text-main mb-2">{t.profile?.photoGuidelines || 'Photo Guidelines'}</h4>
                            <ul className="text-sm text-text-muted space-y-1">
                                <li>• {t.profile?.guidelineClear || 'Use a clear, recent photo'}</li>
                                <li>• {t.profile?.guidelineSquare || 'Square images work best'}</li>
                                <li>• {t.profile?.guidelineSize || 'Maximum file size: 5MB'}</li>
                                <li>• {t.profile?.guidelineFormat || 'Supported formats: JPG, PNG'}</li>
                            </ul>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-teal text-white rounded-xl font-semibold hover:bg-primary-teal/90 transition-colors">
                            <Save className="w-4 h-4" />
                            {t.profile?.savePhoto || 'Save Photo'}
                        </button>
                    </div>
                );

            case 'password':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                {t.profile?.currentPassword || 'Current Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t.profile?.currentPassword || 'Enter current password'}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                {t.profile?.newPassword || 'New Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t.profile?.newPassword || 'Enter new password'}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                {t.profile?.confirmPassword || 'Confirm New Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t.profile?.confirmPassword || 'Confirm new password'}
                                    className="w-full pl-11 pr-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                />
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-teal text-white rounded-xl font-semibold hover:bg-primary-teal/90 transition-colors">
                            <Save className="w-4 h-4" />
                            {t.profile?.updatePassword || 'Update Password'}
                        </button>
                    </div>
                );

            case 'language':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-text-muted mb-4">
                            {t.profile?.selectLanguage || 'Select Language'}
                        </p>
                        <div className="space-y-2">
                            {languages.map((lang) => {
                                const isSelected = language === lang.code;
                                const FlagComponent = lang.flag;
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code as LanguageCode)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                                            isSelected
                                                ? 'bg-primary-teal/10 border-2 border-primary-teal'
                                                : 'bg-bg-soft border-2 border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                            <FlagComponent />
                                        </div>
                                        <span className={`flex-1 text-left font-medium ${
                                            isSelected ? 'text-primary-teal' : 'text-text-main'
                                        }`}>
                                            {lang.name}
                                        </span>
                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-primary-teal flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as typeof activeSection)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-primary-teal/10 rounded-xl flex items-center justify-center shrink-0">
                                    <item.icon className="w-5 h-5 text-primary-teal" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-text-main">{item.label}</p>
                                    <p className="text-sm text-text-muted">{item.description}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary-teal transition-colors" />
                            </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10">
                            <button 
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
                                    <LogOut className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-red-500">{t.profile?.signOut || 'Sign Out'}</p>
                                    <p className="text-sm text-text-muted">{t.profile?.signOutDesc || 'Log out of your account'}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                );
        }
    };

    const getTitle = () => {
        switch (activeSection) {
            case 'personal':
                return t.profile?.personalInfo || 'Personal Information';
            case 'photo':
                return t.profile?.profilePhoto || 'Profile Photo';
            case 'password':
                return t.profile?.changePassword || 'Change Password';
            case 'language':
                return t.profile?.language || 'Language';
            default:
                return t.profile?.settings || 'Profile Settings';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-card-bg shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-black/5 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {activeSection !== 'menu' && (
                                        <button
                                            onClick={() => setActiveSection('menu')}
                                            className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-text-muted rotate-180" />
                                        </button>
                                    )}
                                    <h2 className="text-xl font-bold text-text-main">{getTitle()}</h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* User Info */}
                            {activeSection === 'menu' && (
                                <div className="flex items-center gap-4 mt-6 p-4 bg-bg-soft rounded-xl">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-teal/30">
                                        {avatar ? (
                                            <img
                                                src={avatar}
                                                alt={name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary-teal to-accent-coral flex items-center justify-center text-white text-xl font-bold">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-main">{name}</p>
                                        <p className="text-sm text-text-muted">{email}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {renderContent()}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
