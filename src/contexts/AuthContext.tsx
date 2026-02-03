import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
    onAuthChange,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut as firebaseSignOut,
    getUserDocument,
    type UserDocument,
} from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    userDoc: UserDocument | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);
            
            if (firebaseUser) {
                try {
                    const doc = await getUserDocument(firebaseUser.uid);
                    setUserDoc(doc);
                } catch (err) {
                    console.error('Error fetching user document:', err);
                }
            } else {
                setUserDoc(null);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signInWithEmail(email, password);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
            setError(getErrorMessage(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            setLoading(true);
            await signUpWithEmail(email, password, displayName);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
            setError(getErrorMessage(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signInGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            await signInWithGoogle();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(getErrorMessage(errorMessage));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
            setError(getErrorMessage(errorMessage));
            throw err;
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                userDoc,
                loading,
                error,
                signIn,
                signUp,
                signInGoogle,
                signOut,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper to translate Firebase error codes to user-friendly messages
function getErrorMessage(error: string): string {
    if (error.includes('auth/invalid-email')) {
        return 'Invalid email address';
    }
    if (error.includes('auth/user-disabled')) {
        return 'This account has been disabled';
    }
    if (error.includes('auth/user-not-found')) {
        return 'No account found with this email';
    }
    if (error.includes('auth/wrong-password')) {
        return 'Incorrect password';
    }
    if (error.includes('auth/email-already-in-use')) {
        return 'An account with this email already exists';
    }
    if (error.includes('auth/weak-password')) {
        return 'Password should be at least 6 characters';
    }
    if (error.includes('auth/popup-closed-by-user')) {
        return 'Sign-in popup was closed';
    }
    if (error.includes('auth/network-request-failed')) {
        return 'Network error. Please check your connection';
    }
    if (error.includes('auth/invalid-credential')) {
        return 'Invalid email or password';
    }
    return error;
}
