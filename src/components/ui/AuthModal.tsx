import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, User, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { signIn, signUp, signInGoogle, error, clearError } = useAuth();
    const { t } = useLanguage();

    // Clear error when switching between login/register
    useEffect(() => {
        clearError();
    }, [isLogin, clearError]);

    // Clear form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setName('');
            setIsSubmitting(false);
            clearError();
        }
    }, [isOpen, clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password, name);
            }
            onClose();
            navigate('/dashboard');
        } catch {
            // Error is handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        try {
            await signInGoogle();
            onClose();
            navigate('/dashboard');
        } catch {
            // Error is handled by context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGuestLogin = () => {
        onClose();
        navigate('/dashboard');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col items-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary-teal/10 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-primary-teal fill-current" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-text-main mb-2">
                    {isLogin ? t.auth?.welcomeBack || 'Welcome Back' : t.auth?.joinFamily || 'Join the Family'}
                </h2>
                <p className="text-text-muted text-center mb-8">
                    {isLogin
                        ? t.auth?.continuePreserving || 'Continue preserving the moments that matter.'
                        : t.auth?.startPreserving || 'Start preserving precious memories today.'}
                </p>

                {/* Error Message */}
                {error && (
                    <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-2">
                                {t.auth?.fullName || 'Full Name'}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t.auth?.enterName || 'Enter your name'}
                                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-primary-teal focus:outline-none transition-colors text-text-main bg-white dark:bg-gray-800 placeholder:text-text-muted/50"
                                    required={!isLogin}
                                    disabled={isSubmitting}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Heart className="w-5 h-5 text-primary-teal" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                            {t.auth?.email || 'Email Address'}
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.auth?.enterEmail || 'name@example.com'}
                                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-primary-teal focus:outline-none transition-colors text-text-main bg-white dark:bg-gray-800 placeholder:text-text-muted/50"
                                required
                                disabled={isSubmitting}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Mail className="w-5 h-5 text-primary-teal" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">
                            {t.auth?.password || 'Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.auth?.enterPassword || 'Enter your password'}
                                className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-primary-teal focus:outline-none transition-colors text-text-main bg-white dark:bg-gray-800 placeholder:text-text-muted/50"
                                required
                                disabled={isSubmitting}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <Lock className="w-5 h-5 text-primary-teal" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-teal transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-sm text-primary-teal hover:underline font-medium"
                            >
                                {t.auth?.forgotPassword || 'Forget Password?'}
                            </button>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full !py-4 !text-lg flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isLogin ? t.auth?.signIn || 'Sign In' : t.auth?.createAccount || 'Create Account'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="w-full py-3 flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-main font-medium disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </button>

                    {/* Guest Login Button */}
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full !py-3 flex items-center justify-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-text-muted"
                        onClick={handleGuestLogin}
                        disabled={isSubmitting}
                    >
                        <User className="w-5 h-5" />
                        {t.auth?.continueAsGuest || 'Continue as Guest'}
                    </Button>

                </form>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-xs text-text-muted font-medium tracking-wider">
                        {t.auth?.orJoin || 'OR JOIN THE FAMILY'}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>

                {/* Toggle Login/Register */}
                <p className="text-sm text-text-muted">
                    {isLogin ? (t.auth?.noAccount || "Don't have an account? ") : (t.auth?.hasAccount || "Already have an account? ")}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary-teal font-semibold hover:underline"
                    >
                        {isLogin ? t.auth?.createOne || 'Create one' : t.auth?.signIn || 'Sign in'}
                    </button>
                </p>
            </div>
        </Modal>
    );
};
