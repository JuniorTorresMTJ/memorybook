/**
 * Hook for persisting wizard data in localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import type { MemoryBookData, WizardStep, ReferenceInputMode, PhysicalCharacteristicsData } from './types';
import { getInitialMemoryBookData, getInitialPhysicalCharacteristics, getInitialMemories } from './types';

const STORAGE_KEY = 'memorybook_wizard_draft';
const STEP_KEY = 'memorybook_wizard_step';
const COMPLETED_STEPS_KEY = 'memorybook_wizard_completed';
const MODE_KEY = 'memorybook_wizard_mode';

interface StoredBookSetup {
    pageCount: MemoryBookData['bookSetup']['pageCount'];
    illustrationStyle: MemoryBookData['bookSetup']['illustrationStyle'];
    title: string;
    subtitle: string;
    date: string;
    referencePhotoCount: number;
    referenceInputMode: ReferenceInputMode;
    physicalCharacteristics: PhysicalCharacteristicsData;
}

interface StoredData {
    data: Omit<MemoryBookData, 'bookSetup'> & {
        bookSetup: StoredBookSetup;
    };
    timestamp: number;
}

/**
 * Serialize wizard data for storage (excluding File objects)
 */
function serializeData(data: MemoryBookData): StoredData['data'] {
    return {
        ...data,
        bookSetup: {
            pageCount: data.bookSetup.pageCount,
            illustrationStyle: data.bookSetup.illustrationStyle,
            title: data.bookSetup.title,
            subtitle: data.bookSetup.subtitle,
            date: data.bookSetup.date,
            referencePhotoCount: data.bookSetup.referencePhotos.length,
            referenceInputMode: data.bookSetup.referenceInputMode,
            physicalCharacteristics: data.bookSetup.physicalCharacteristics,
        },
        childhood: { ...data.childhood, photos: [] },
        teenage: { ...data.teenage, photos: [] },
        adultLife: { ...data.adultLife, photos: [] },
        laterLife: { ...data.laterLife, photos: [] },
    };
}

/**
 * Deserialize stored data back to wizard format
 */
function deserializeData(stored: StoredData['data']): MemoryBookData {
    const initial = getInitialMemoryBookData();
    return {
        ...stored,
        bookSetup: {
            ...stored.bookSetup,
            referencePhotos: [], // Photos need to be re-uploaded
            referenceInputMode: stored.bookSetup.referenceInputMode || 'photos',
            physicalCharacteristics: stored.bookSetup.physicalCharacteristics || getInitialPhysicalCharacteristics(),
        },
        // Ensure memories field exists (backwards compatibility with old drafts)
        memories: (stored as any).memories || getInitialMemories(),
        // Legacy fields kept for backwards compatibility
        childhood: {
            ...initial.childhood,
            ...stored.childhood,
            photos: [],
        },
        teenage: {
            ...initial.teenage,
            ...stored.teenage,
            photos: [],
        },
        adultLife: {
            ...initial.adultLife,
            ...stored.adultLife,
            photos: [],
        },
        laterLife: {
            ...initial.laterLife,
            ...stored.laterLife,
            photos: [],
        },
    };
}

/**
 * Check if stored data is still valid (less than 24 hours old)
 */
function isDataValid(stored: StoredData): boolean {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    return Date.now() - stored.timestamp < ONE_DAY_MS;
}

export function useWizardPersistence() {
    const [isLoaded, setIsLoaded] = useState(false);

    /**
     * Load saved data from localStorage
     */
    const loadSavedData = useCallback((): {
        data: MemoryBookData;
        step: WizardStep;
        completedSteps: Set<WizardStep>;
        wizardMode: 'brief' | 'detailed' | null;
    } | null => {
        try {
            const storedJson = localStorage.getItem(STORAGE_KEY);
            const storedStep = localStorage.getItem(STEP_KEY);
            const storedCompleted = localStorage.getItem(COMPLETED_STEPS_KEY);
            const storedMode = localStorage.getItem(MODE_KEY);

            if (!storedJson) return null;

            const stored: StoredData = JSON.parse(storedJson);
            
            if (!isDataValid(stored)) {
                clearSavedData();
                return null;
            }

            const data = deserializeData(stored.data);
            const step = (storedStep ? parseInt(storedStep, 10) : 1) as WizardStep;
            const completedSteps = new Set<WizardStep>(
                storedCompleted ? JSON.parse(storedCompleted) : []
            );
            const wizardMode = (storedMode === 'brief' || storedMode === 'detailed') ? storedMode : null;

            return { data, step, completedSteps, wizardMode };
        } catch (error) {
            console.error('Failed to load wizard data:', error);
            return null;
        }
    }, []);

    /**
     * Save data to localStorage
     */
    const saveData = useCallback((
        data: MemoryBookData,
        step: WizardStep,
        completedSteps: Set<WizardStep>,
        wizardMode?: 'brief' | 'detailed' | null
    ) => {
        try {
            const stored: StoredData = {
                data: serializeData(data),
                timestamp: Date.now(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            localStorage.setItem(STEP_KEY, step.toString());
            localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify([...completedSteps]));
            if (wizardMode) {
                localStorage.setItem(MODE_KEY, wizardMode);
            }
        } catch (error) {
            console.error('Failed to save wizard data:', error);
        }
    }, []);

    /**
     * Clear saved data from localStorage
     */
    const clearSavedData = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STEP_KEY);
            localStorage.removeItem(COMPLETED_STEPS_KEY);
            localStorage.removeItem(MODE_KEY);
        } catch (error) {
            console.error('Failed to clear wizard data:', error);
        }
    }, []);

    /**
     * Check if there's saved data available
     */
    const hasSavedData = useCallback((): boolean => {
        try {
            const storedJson = localStorage.getItem(STORAGE_KEY);
            if (!storedJson) return false;

            const stored: StoredData = JSON.parse(storedJson);
            return isDataValid(stored);
        } catch {
            return false;
        }
    }, []);

    // Mark as loaded after first render
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return {
        isLoaded,
        loadSavedData,
        saveData,
        clearSavedData,
        hasSavedData,
    };
}
