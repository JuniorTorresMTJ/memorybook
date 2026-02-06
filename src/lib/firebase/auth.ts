import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInAnonymously,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    type User,
    type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserDocument, UserDocumentInput } from './types';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Create a new user with email and password
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(userCredential.user, { displayName, email });
    
    return userCredential;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<UserCredential> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login timestamp
    await updateLastLogin(userCredential.user.uid);
    
    return userCredential;
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Create or update user document
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
        await createUserDocument(userCredential.user, {
            displayName: userCredential.user.displayName || 'User',
            email: userCredential.user.email || '',
            photoURL: userCredential.user.photoURL || undefined,
        });
    } else {
        await updateLastLogin(userCredential.user.uid);
    }
    
    return userCredential;
};

/**
 * Sign in anonymously (for guest users)
 */
export const signInAnonymousUser = async (): Promise<UserCredential> => {
    const userCredential = await signInAnonymously(auth);
    return userCredential;
};

/**
 * Ensure user is authenticated (sign in anonymously if not)
 */
export const ensureAuthenticated = async (): Promise<User> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        return currentUser;
    }
    
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
};

// Alias for backwards compatibility
export const signOutUser = signOut;

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
};

/**
 * Get the current user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// ============================================
// FIRESTORE USER DOCUMENT HELPERS
// ============================================

/**
 * Create user document in Firestore
 */
const createUserDocument = async (
    user: User,
    data: UserDocumentInput
): Promise<void> => {
    const userRef = doc(db, 'users', user.uid);
    
    const userData: Omit<UserDocument, 'createdAt' | 'lastLoginAt'> & {
        createdAt: ReturnType<typeof serverTimestamp>;
        lastLoginAt: ReturnType<typeof serverTimestamp>;
    } = {
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
    };
    
    await setDoc(userRef, userData);
};

/**
 * Update last login timestamp
 */
const updateLastLogin = async (userId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (userId: string): Promise<UserDocument | null> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        return userDoc.data() as UserDocument;
    }
    
    return null;
};

/**
 * Update user profile in both Auth and Firestore
 */
export const updateUserProfile = async (
    userId: string,
    data: Partial<UserDocumentInput>
): Promise<void> => {
    const user = auth.currentUser;
    
    if (user && user.uid === userId) {
        // Update Auth profile
        if (data.displayName || data.photoURL) {
            await updateProfile(user, {
                displayName: data.displayName,
                photoURL: data.photoURL,
            });
        }
    }
    
    // Update Firestore document
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data, { merge: true });
};
